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

package vo

import (
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type WorkFlowAsToolInfo struct {
	ID            int64
	Name          string
	Desc          string
	IconURL       string
	PublishStatus PublishStatus
	VersionName   string
	CreatorID     int64
	InputParams   []*NamedTypeInfo
	CreatedAt     int64
	UpdatedAt     *int64
}

type ToolDetailInfo struct {
	ApiDetailData *workflow.ApiDetailData
	ToolInputs    any
	ToolOutputs   any
}

func (t *ToolDetailInfo) MarshalJSON() ([]byte, error) {
	bs, _ := sonic.Marshal(t.ApiDetailData)
	result := make(map[string]any)
	_ = sonic.Unmarshal(bs, &result)
	result["inputs"] = t.ToolInputs
	result["outputs"] = t.ToolOutputs
	return sonic.Marshal(result)
}
