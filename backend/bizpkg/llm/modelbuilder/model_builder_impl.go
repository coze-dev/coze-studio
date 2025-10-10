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

package modelbuilder

import (
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

func SupportProtocol(modelClass developer_api.ModelClass) bool {
	if modelClass == developer_api.ModelClass_GPT ||
		modelClass == developer_api.ModelClass_Claude ||
		modelClass == developer_api.ModelClass_DeekSeek ||
		modelClass == developer_api.ModelClass_SEED ||
		modelClass == developer_api.ModelClass_Gemini ||
		modelClass == developer_api.ModelClass_Llama ||
		modelClass == developer_api.ModelClass_QWen {
		return true
	}
	return false
}
