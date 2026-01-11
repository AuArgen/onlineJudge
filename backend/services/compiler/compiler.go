package compiler

import (
	"archive/tar"
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

// CompilerSubmission is a DTO to avoid circular dependency with models
type CompilerSubmission struct {
	SourceCode  string
	LanguageID  int
	Stdin       string
	TimeLimit   float64
	MemoryLimit int
}

type ExecutionResult struct {
	Stdout        string
	Stderr        string
	ExecutionTime string
}

// Basic security check for dangerous keywords
func checkSecurity(code string, langID int) error {
	dangerous := []string{}
	switch langID {
	case 71: // Python
		dangerous = []string{"os.system", "subprocess", "exec(", "eval(", "open(", "import os", "import subprocess"}
	case 63: // Node.js
		dangerous = []string{"child_process", "exec(", "spawn(", "fs.", "process.exit"}
	case 60: // Go
		dangerous = []string{"os/exec", "syscall", "net/http", "os.Exit"}
	case 54: // C++
		dangerous = []string{"system(", "exec(", "fork(", "popen("}
	case 62: // Java
		dangerous = []string{"Runtime.getRuntime", "ProcessBuilder", "System.exit"}
	}

	for _, keyword := range dangerous {
		if strings.Contains(code, keyword) {
			return fmt.Errorf("security violation: forbidden keyword '%s'", keyword)
		}
	}
	return nil
}

// ExecuteCode runs the submission in an isolated Docker container
func ExecuteCode(sub CompilerSubmission) (ExecutionResult, error) {
	if err := checkSecurity(sub.SourceCode, sub.LanguageID); err != nil {
		return ExecutionResult{}, err
	}

	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithVersion("1.44"))
	if err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to create docker client: %v", err)
	}
	defer cli.Close()

	var imageName string
	var compileCmd []string
	var runCmd []string
	var fileName string
	var env []string

	// Adjust TimeLimit for compiled languages or 'go run' which includes build time
	effectiveTimeLimit := sub.TimeLimit
	if sub.LanguageID == 60 { // Go
		effectiveTimeLimit += 10.0 // Add 10s buffer for 'go run' compilation (first run is slow)
	} else if sub.LanguageID == 62 { // Java
		effectiveTimeLimit += 2.0 // Java startup is slow
	}

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
		imageName = "golang:1.23-alpine"
		fileName = "main.go"
		env = []string{"GOCACHE=/tmp/gocache", "CGO_ENABLED=0"}
		runCmd = []string{"go", "run", "main.go"}
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

	if err := ensureImage(ctx, cli, imageName); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to pull image %s: %v", imageName, err)
	}

	memoryLimitMB := sub.MemoryLimit
	if memoryLimitMB < 512 {
		memoryLimitMB = 512
	}

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image:           imageName,
		Cmd:             []string{"sleep", "infinity"},
		Tty:             false,
		NetworkDisabled: true,
		OpenStdin:       true,
		WorkingDir:      "/app",
		Env:             env,
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

	if err := cli.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to start container: %v", err)
	}

	if err := copyToContainer(ctx, cli, containerID, fileName, sub.SourceCode); err != nil {
		return ExecutionResult{}, fmt.Errorf("failed to copy code: %v", err)
	}

	if len(compileCmd) > 0 {
		execConfig := types.ExecConfig{
			Cmd:          compileCmd,
			AttachStderr: true,
			AttachStdout: true,
			WorkingDir:   "/app",
			Env:          env,
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
			return ExecutionResult{Stderr: "Compilation Error:\n" + errBuf.String()}, nil
		}
	}

	execConfig := types.ExecConfig{
		Cmd:          runCmd,
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   "/app",
		Env:          env,
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

	if effectiveTimeLimit <= 0 {
		effectiveTimeLimit = 5.0
	}

	select {
	case <-outputDone:
	case <-time.After(time.Duration(effectiveTimeLimit*1000) * time.Millisecond):
		return ExecutionResult{
			Stdout:        stdout.String(),
			Stderr:        stderr.String() + fmt.Sprintf("\nExecution Timed Out (Limit: %.1fs)", sub.TimeLimit),
			ExecutionTime: fmt.Sprintf(">%.1fs", sub.TimeLimit),
		}, nil
	}

	duration := time.Since(startTime)

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

	reader, err := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		return err
	}
	defer reader.Close()

	io.Copy(io.Discard, reader)
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
