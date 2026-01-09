package compiler

import (
	"archive/tar"
	"bytes"
	"context"
	"fmt"
	"io"
	"onlineJudge/models"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

type ExecutionResult struct {
	Stdout        string
	Stderr        string
	ExecutionTime string
}

// ExecuteCode runs the submission in an isolated Docker container
func ExecuteCode(sub models.Submission) (ExecutionResult, error) {
	fmt.Printf("Executing code for language ID: %d\n", sub.LanguageID)

	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to create docker client: %v", err)
	}

	var imageName string
	var compileCmd []string
	var runCmd []string
	var fileName string

	switch sub.LanguageID {
	case 71: // Python 3.8
		imageName = "python:3.8-slim"
		fileName = "main.py"
		runCmd = []string{"python3", fileName}
	case 63: // Node.js
		imageName = "node:14-alpine"
		fileName = "main.js"
		runCmd = []string{"node", fileName}
	case 60: // Go
		// Changed to standard golang image (debian based) for better compatibility
		imageName = "golang:1.21"
		fileName = "main.go"
		compileCmd = []string{"go", "build", "-o", "main", "main.go"}
		runCmd = []string{"./main"}
	case 54: // C++ (GCC)
		imageName = "gcc:latest"
		fileName = "main.cpp"
		compileCmd = []string{"g++", "-o", "main", "main.cpp"}
		runCmd = []string{"./main"}
	case 62: // Java (OpenJDK)
		imageName = "eclipse-temurin:11-jdk-jammy"
		fileName = "Main.java"
		compileCmd = []string{"javac", "Main.java"}
		runCmd = []string{"java", "Main"}
	default:
		return ExecutionResult{}, fmt.Errorf("unsupported language id: %d", sub.LanguageID)
	}

	// 0. Ensure Image Exists
	if err := ensureImage(ctx, cli, imageName); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to pull image %s: %v", imageName, err)
	}

	// Calculate memory limit
	memoryLimitMB := sub.MemoryLimit
	if memoryLimitMB < 512 {
		memoryLimitMB = 512
	}

	// 1. Create Container (Idle)
	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image:           imageName,
		Cmd:             []string{"sleep", "infinity"},
		Tty:             false,
		NetworkDisabled: true,
		OpenStdin:       true,
		WorkingDir:      "/app",
	}, &container.HostConfig{
		Resources: container.Resources{
			Memory:   int64(memoryLimitMB * 1024 * 1024),
			NanoCPUs: 1000000000,
		},
	}, nil, nil, "")
	if err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to create container: %v", err)
	}

	containerID := resp.ID
	defer func() {
		cli.ContainerRemove(ctx, containerID, container.RemoveOptions{Force: true})
	}()

	// 2. Start Container
	if err := cli.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to start container: %v", err)
	}

	// 3. Copy Source Code
	if err := copyToContainer(ctx, cli, containerID, fileName, sub.SourceCode); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to copy code: %v", err)
	}

	// 4. Compile (if needed)
	if len(compileCmd) > 0 {
		fmt.Println("Compiling...")
		execConfig := types.ExecConfig{
			Cmd:          compileCmd,
			AttachStderr: true,
			AttachStdout: true,
			WorkingDir:   "/app",
		}
		execIDResp, err := cli.ContainerExecCreate(ctx, containerID, execConfig)
		if err != nil {
			return ExecutionResult{}, fmt.Errorf("failed to create exec for compilation: %v", err)
		}

		resp, err := cli.ContainerExecAttach(ctx, execIDResp.ID, types.ExecStartCheck{})
		if err != nil {
			return ExecutionResult{}, fmt.Errorf("failed to attach exec for compilation: %v", err)
		}
		defer resp.Close()

		var errBuf bytes.Buffer
		stdcopy.StdCopy(&errBuf, &errBuf, resp.Reader)

		inspectResp, err := cli.ContainerExecInspect(ctx, execIDResp.ID)
		if err == nil && inspectResp.ExitCode != 0 {
			fmt.Printf("Compilation failed: %s\n", errBuf.String())
			return ExecutionResult{Stderr: "Compilation Error:\n" + errBuf.String()}, nil
		}
		fmt.Println("Compilation successful")
	}

	// 5. Run Code
	fmt.Println("Running code...")
	execConfig := types.ExecConfig{
		Cmd:          runCmd,
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   "/app",
	}
	execIDResp, err := cli.ContainerExecCreate(ctx, containerID, execConfig)
	if err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to create exec for run: %v", err)
	}

	respAttach, err := cli.ContainerExecAttach(ctx, execIDResp.ID, types.ExecStartCheck{})
	if err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to attach exec for run: %v", err)
	}
	defer respAttach.Close()

	go func() {
		defer respAttach.CloseWrite()
		io.Copy(respAttach.Conn, strings.NewReader(sub.Stdin))
	}()

	startTime := time.Now()

	var stdout, stderr bytes.Buffer
	outputDone := make(chan error)
	go func() {
		_, err := stdcopy.StdCopy(&stdout, &stderr, respAttach.Reader)
		outputDone <- err
	}()

	timeLimit := sub.TimeLimit
	if timeLimit <= 0 {
		timeLimit = 5.0
	}

	select {
	case <-outputDone:
		// Process finished
	case <-time.After(time.Duration(timeLimit*1000) * time.Millisecond):
		fmt.Println("Execution timed out")
		return ExecutionResult{
			Stdout:        stdout.String(),
			Stderr:        stderr.String() + fmt.Sprintf("\nExecution Timed Out (Limit: %.1fs)", timeLimit),
			ExecutionTime: fmt.Sprintf(">%.1fs", timeLimit),
		}, nil
	}

	duration := time.Since(startTime)
	fmt.Printf("Execution finished in %s. Stdout: %s, Stderr: %s\n", duration, stdout.String(), stderr.String())

	return ExecutionResult{
		Stdout:        stdout.String(),
		Stderr:        stderr.String(),
		ExecutionTime: duration.String(),
	}, nil
}

func ensureImage(ctx context.Context, cli *client.Client, imageName string) error {
	_, _, err := cli.ImageInspectWithRaw(ctx, imageName)
	if err == nil {
		return nil
	}

	fmt.Printf("Pulling image %s...\n", imageName)
	reader, err := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		return err
	}
	defer reader.Close()

	io.Copy(io.Discard, reader)
	fmt.Printf("Successfully pulled image %s\n", imageName)
	return nil
}

func copyToContainer(ctx context.Context, cli *client.Client, containerID, filename, content string) error {
	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)

	hdr := &tar.Header{
		Name: filename,
		Mode: 0644,
		Size: int64(len(content)),
	}
	if err := tw.WriteHeader(hdr); err != nil {
		return err
	}
	if _, err := tw.Write([]byte(content)); err != nil {
		return err
	}
	if err := tw.Close(); err != nil {
		return err
	}

	return cli.CopyToContainer(ctx, containerID, "/app", &buf, types.CopyToContainerOptions{})
}
