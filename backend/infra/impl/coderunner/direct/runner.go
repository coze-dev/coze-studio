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

package direct

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"

	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

var pythonCode = `
import asyncio
import json
import sys

class Args:
    def __init__(self, params):
        self.params = params

class Output(dict):
    pass

%s

try:
    result = asyncio.run(main( Args(json.loads(sys.argv[1]))))
    print(json.dumps(result))
except Exception as  e:
    print(f"{type(e).__name__}: {str(e)}", file=sys.stderr)
    sys.exit(1)

`

func NewRunner() coderunner.Runner {
	return &runner{}
}

type runner struct{}

func (r *runner) Run(ctx context.Context, request *coderunner.RunRequest) (*coderunner.RunResponse, error) {
	var (
		params = request.Params
		c      = request.Code
	)
	if request.Language == coderunner.Python {
		ret, err := r.pythonCmdRun(ctx, c, params)
		if err != nil {
			return nil, err
		}
		return &coderunner.RunResponse{
			Result: ret,
		}, nil
	}
	return nil, fmt.Errorf("unsupported language: %s", request.Language)
}

func (r *runner) pythonCmdRun(_ context.Context, code string, params map[string]any) (map[string]any, error) {
	bs, err := sonic.Marshal(params)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal params to json, err: %w", err)
	}
	cmd := exec.Command(goutil.GetPython3Path(), "-c", fmt.Sprintf(pythonCode, code), string(bs)) // ignore_security_alert RCE
	stdout := new(bytes.Buffer)
	stderr := new(bytes.Buffer)
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	err = cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("failed to run python script err: %s, std err: %s", err.Error(), stderr.String())
	}
	if stderr.String() != "" {
		return nil, fmt.Errorf("failed to run python script err: %s", stderr.String())
	}

	ret := make(map[string]any)
	err = sonic.Unmarshal(stdout.Bytes(), &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil
}
