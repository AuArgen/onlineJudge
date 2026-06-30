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

type CompilerSubmission struct {
	SourceCode  string
	LanguageID  int
	TimeLimit   float64
	MemoryLimit int
}

type TestResult struct {
	Stdout        string
	Stderr        string
	ExecutionTime string
	TimedOut      bool
}

func checkSecurity(code string, langID int) error {
	var dangerous []string
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

// ExecuteCode compiles once and runs all test cases in a single Docker container.
func ExecuteCode(sub CompilerSubmission, inputs []string) ([]TestResult, error) {
	if err := checkSecurity(sub.SourceCode, sub.LanguageID); err != nil {
		return nil, err
	}
	if len(inputs) == 0 {
		return []TestResult{}, nil
	}

	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithVersion("1.44"))
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %v", err)
	}
	defer cli.Close()

	var imageName, fileName string
	var compileCmd, runCmd, env []string

	switch sub.LanguageID {
	case 71: // Python 3.8
		imageName = "python:3.8-slim"
		fileName = "main.py"
		runCmd = []string{"python3", "main.py"}
	case 63: // Node.js
		imageName = "node:14-alpine"
		fileName = "main.js"
		runCmd = []string{"node", "main.js"}
	case 60: // Go — build binary once, run N times (much faster than go run)
		imageName = "golang:1.23-alpine"
		fileName = "main.go"
		env = []string{"GOCACHE=/tmp/gocache", "CGO_ENABLED=0"}
		compileCmd = []string{"go", "build", "-o", "main", "main.go"}
		runCmd = []string{"./main"}
	case 54: // C++ (GCC)
		imageName = "gcc:latest"
		fileName = "main.cpp"
		compileCmd = []string{"g++", "-O2", "-o", "main", "main.cpp"}
		runCmd = []string{"./main"}
	case 62: // Java
		imageName = "eclipse-temurin:11-jdk-jammy"
		fileName = "Main.java"
		compileCmd = []string{"javac", "Main.java"}
		runCmd = []string{"java", "Main"}
	default:
		return nil, fmt.Errorf("unsupported language id: %d", sub.LanguageID)
	}

	if err := ensureImage(ctx, cli, imageName); err != nil {
		return nil, fmt.Errorf("failed to pull image %s: %v", imageName, err)
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
		return nil, fmt.Errorf("failed to create container: %v", err)
	}

	containerID := resp.ID
	defer cli.ContainerRemove(ctx, containerID, container.RemoveOptions{Force: true})

	if err := cli.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return nil, fmt.Errorf("failed to start container: %v", err)
	}

	if err := copyToContainer(ctx, cli, containerID, fileName, sub.SourceCode); err != nil {
		return nil, fmt.Errorf("failed to copy code: %v", err)
	}

	// Compile once
	if len(compileCmd) > 0 {
		compileOutput, exitCode := compile(ctx, cli, containerID, compileCmd, env)
		if exitCode != 0 {
			compileErr := TestResult{Stderr: "Compilation Error:\n" + compileOutput}
			results := make([]TestResult, len(inputs))
			for i := range results {
				results[i] = compileErr
			}
			return results, nil
		}
	}

	timeLimit := sub.TimeLimit
	if timeLimit <= 0 {
		timeLimit = 5.0
	}
	timeout := time.Duration(timeLimit*1000) * time.Millisecond

	results := make([]TestResult, len(inputs))
	for i, input := range inputs {
		stdout, stderr, duration, timedOut := runOnce(ctx, cli, containerID, runCmd, env, input, timeout)
		execTime := duration.String()
		if timedOut {
			execTime = fmt.Sprintf(">%.1fs", timeLimit)
		}
		results[i] = TestResult{
			Stdout:        stdout,
			Stderr:        stderr,
			ExecutionTime: execTime,
			TimedOut:      timedOut,
		}
	}

	return results, nil
}

func compile(ctx context.Context, cli *client.Client, containerID string, cmd []string, env []string) (string, int) {
	execCfg := types.ExecConfig{
		Cmd:          cmd,
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   "/app",
		Env:          env,
	}
	execResp, err := cli.ContainerExecCreate(ctx, containerID, execCfg)
	if err != nil {
		return err.Error(), 1
	}
	attach, err := cli.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{})
	if err != nil {
		return err.Error(), 1
	}
	defer attach.Close()

	var buf bytes.Buffer
	stdcopy.StdCopy(&buf, &buf, attach.Reader)

	inspect, err := cli.ContainerExecInspect(ctx, execResp.ID)
	if err != nil {
		return buf.String(), 0
	}
	return buf.String(), inspect.ExitCode
}

func runOnce(ctx context.Context, cli *client.Client, containerID string, cmd []string, env []string, stdin string, timeout time.Duration) (stdout, stderr string, duration time.Duration, timedOut bool) {
	execCfg := types.ExecConfig{
		Cmd:          cmd,
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   "/app",
		Env:          env,
	}
	execResp, err := cli.ContainerExecCreate(ctx, containerID, execCfg)
	if err != nil {
		return "", err.Error(), 0, false
	}
	attach, err := cli.ContainerExecAttach(ctx, execResp.ID, types.ExecStartCheck{})
	if err != nil {
		return "", err.Error(), 0, false
	}
	defer attach.Close()

	go func() {
		defer attach.CloseWrite()
		io.Copy(attach.Conn, strings.NewReader(stdin))
	}()

	start := time.Now()

	var outBuf, errBuf bytes.Buffer
	done := make(chan struct{})
	go func() {
		stdcopy.StdCopy(&outBuf, &errBuf, attach.Reader)
		close(done)
	}()

	select {
	case <-done:
		return outBuf.String(), errBuf.String(), time.Since(start), false
	case <-time.After(timeout):
		return outBuf.String(), errBuf.String(), time.Since(start), true
	}
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
