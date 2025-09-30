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
package impl

import (
	"os"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner/impl/direct"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner/impl/sandbox"
)

type Runner = coderunner.Runner

func New(conf *config.BasicConfiguration) Runner {
	switch conf.CodeRunnerType {
	case config.CodeRunnerType_Sandbox:
		getAndSplit := func(key string) []string {
			v := os.Getenv(key)
			if v == "" {
				return nil
			}
			return strings.Split(v, ",")
		}
		config := &sandbox.Config{
			AllowEnv:       getAndSplit(conf.SandboxConfig.AllowEnv),
			AllowRead:      getAndSplit(conf.SandboxConfig.AllowRead),
			AllowWrite:     getAndSplit(conf.SandboxConfig.AllowWrite),
			AllowNet:       getAndSplit(conf.SandboxConfig.AllowNet),
			AllowRun:       getAndSplit(conf.SandboxConfig.AllowRun),
			AllowFFI:       getAndSplit(conf.SandboxConfig.AllowFfi),
			NodeModulesDir: conf.SandboxConfig.NodeModulesDir,
			TimeoutSeconds: conf.SandboxConfig.TimeoutSeconds,
			MemoryLimitMB:  conf.SandboxConfig.MemoryLimitMb,
		}

		return sandbox.NewRunner(config)
	default:
		return direct.NewRunner()
	}
}
