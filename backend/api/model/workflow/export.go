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

// ExportWorkflowRequest 工作流导出请求
type ExportWorkflowRequest struct {
	WorkflowID         string `json:"workflow_id" binding:"required"`         // 工作流ID
	IncludeDependencies bool   `json:"include_dependencies"`                  // 是否包含依赖资源
	ExportFormat       string `json:"export_format" binding:"required"`       // 导出格式，目前支持 "json"
	base.Base
}

// ExportWorkflowResponse 工作流导出响应
type ExportWorkflowResponse struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		WorkflowExport *WorkflowExportData `json:"workflow_export,omitempty"`
	} `json:"data"`
	base.BaseResp
}

// WorkflowExportData 工作流导出数据
type WorkflowExportData struct {
	WorkflowID   string                 `json:"workflow_id"`
	Name         string                 `json:"name"`
	Description  string                 `json:"description"`
	Version      string                 `json:"version"`
	CreateTime   int64                  `json:"create_time"`
	UpdateTime   int64                  `json:"update_time"`
	Schema       map[string]interface{} `json:"schema"`
	Nodes        []interface{}          `json:"nodes"`
	Edges        []interface{}          `json:"edges"`
	Metadata     map[string]interface{} `json:"metadata"`
	Dependencies []interface{}          `json:"dependencies,omitempty"`
}
