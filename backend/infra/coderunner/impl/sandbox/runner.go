/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package sandbox

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"

	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func NewRunner(config *Config) coderunner.Runner {
	return &runner{
		pyPath:     goutil.GetPython3Path(),
		scriptPath: goutil.GetPythonFilePath("sandbox.py"),
		config:     config,
	}
}

type Config struct {
	AllowEnv       []string `json:"allow_env,omitempty"`
	AllowRead      []string `json:"allow_read,omitempty"`
	AllowWrite     []string `json:"allow_write,omitempty"`
	AllowNet       []string `json:"allow_net,omitempty"`
	AllowRun       []string `json:"allow_run,omitempty"`
	AllowFFI       []string `json:"allow_ffi,omitempty"`
	NodeModulesDir string   `json:"node_modules_dir,omitempty"`
	TimeoutSeconds float64  `json:"timeout_seconds,omitempty"`
	MemoryLimitMB  int64    `json:"memory_limit_mb,omitempty"`
}

type runner struct {
	pyPath, scriptPath string
	config             *Config
}

func (runner *runner) Run(ctx context.Context, request *coderunner.RunRequest) (*coderunner.RunResponse, error) {
	if request.Language == coderunner.JavaScript {
		return nil, fmt.Errorf("js not supported yet")
	}
	b, err := json.Marshal(req{
		Config: runner.config,
		Code:   request.Code,
		Params: request.Params,
	})
	if err != nil {
		return nil, err
	}
	pr, pw, err := os.Pipe()
	if err != nil {
		return nil, err
	}
	r, w, err := os.Pipe()
	if err != nil {
		return nil, err
	}
	if _, err = pw.Write(b); err != nil {
		return nil, err
	}
	if err = pw.Close(); err != nil {
		return nil, err
	}
	cmd := exec.Command(runner.pyPath, runner.scriptPath)
	cmd.ExtraFiles = []*os.File{w, pr}
	if err = cmd.Start(); err != nil {
		return nil, err
	}
	if err = w.Close(); err != nil {
		return nil, err
	}
	result := &resp{}
	d := json.NewDecoder(r)
	d.UseNumber()
	if err = d.Decode(result); err != nil {
		return nil, err
	}
	if err = cmd.Wait(); err != nil {
		return nil, err
	}
	logs.CtxDebugf(ctx, "resp=%v\n", result)
	if result.Status != "success" {
		return nil, fmt.Errorf("exec failed, stdout=%s, stderr=%s, sandbox_err=%s", result.Stdout, result.Stderr, result.SandboxError)
	}
	return &coderunner.RunResponse{Result: result.Result}, nil
}

type req struct {
	Config *Config        `json:"config"`
	Code   string         `json:"code"`
	Params map[string]any `json:"params"`
}

type resp struct {
	Result        map[string]any `json:"result"`
	Stdout        string         `json:"stdout"`
	Stderr        string         `json:"stderr"`
	Status        string         `json:"status"`
	ExecutionTime float64        `json:"execution_time"`
	SandboxError  string         `json:"sandbox_error"`
}
