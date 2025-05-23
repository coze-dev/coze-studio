package coderunner

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"runtime"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
)

type Runner struct {
}

func NewRunner() *Runner {
	return &Runner{}
}

func (r *Runner) Run(ctx context.Context, request *code.RunRequest) (*code.RunResponse, error) {
	var (
		params = request.Params
		c      = request.Code
	)
	if request.Language == code.Python {
		ret, err := r.pythonCmdRun(ctx, c, params)
		if err != nil {
			return nil, err
		}
		return &code.RunResponse{
			Result: ret,
		}, nil
	}
	return nil, fmt.Errorf("unsupported language: %s", request.Language)
}

func (r *Runner) pythonCmdRun(_ context.Context, code string, params map[string]any) (map[string]any, error) {
	bs, _ := json.Marshal(params)
	// TODO Instead of using the stack information to get the path, you need to move the script under the resource
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return nil, errors.New("get runtime caller info failed")
	}
	dir := filepath.Dir(file)

	cmd := exec.Command("python3", "script/python_script.py", code, string(bs))
	cmd.Dir = dir
	stdout := new(bytes.Buffer)
	stderr := new(bytes.Buffer)
	cmd.Stdout = stdout
	cmd.Stderr = stderr

	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("failed to run python script err: %s, std err: %s", err, stderr.String())
	}

	if stderr.String() != "" {
		return nil, fmt.Errorf("failed to run python script err: %s", stderr.String())
	}
	ret := make(map[string]any)
	err = json.Unmarshal(stdout.Bytes(), &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil

}
