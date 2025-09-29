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

package code

import (
	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
)

func GetCodeRunner() coderunner.Runner {
	return runnerImpl
}

func SetCodeRunner(runner coderunner.Runner) {
	runnerImpl = runner
}

var runnerImpl coderunner.Runner
