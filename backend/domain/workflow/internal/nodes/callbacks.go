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

package nodes

import "github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"

type StructuredCallbackOutput struct {
	Output    map[string]any
	RawOutput map[string]any
	Extra     map[string]any // node specific extra info, will go into node execution's extra.ResponseExtra
	Error     vo.WorkflowError
}
