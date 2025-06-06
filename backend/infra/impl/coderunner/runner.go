package coderunner

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"

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
	cmd := exec.Command(".venv/bin/python3", "python_script.py", code, string(bs))
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
