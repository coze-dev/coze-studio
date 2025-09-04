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

package workflow

import "github.com/coze-dev/coze-studio/backend/api/model/base"

// ImportWorkflowRequest 工作流导入请求
type ImportWorkflowRequest struct {
	WorkflowData     string `json:"workflow_data" binding:"required"`     // 工作流数据（JSON或YAML格式）
	WorkflowName     string `json:"workflow_name" binding:"required"`     // 工作流名称
	SpaceID          string `json:"space_id" binding:"required"`          // 工作空间ID
	CreatorID        string `json:"creator_id" binding:"required"`        // 创建者ID
	ImportFormat     string `json:"import_format" binding:"required"`     // 导入格式，支持 "json", "yml", "yaml"
	base.Base
}

// ImportWorkflowResponse 工作流导入响应
type ImportWorkflowResponse struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		WorkflowID string `json:"workflow_id,omitempty"` // 新创建的工作流ID
	} `json:"data"`
	base.BaseResp
} 