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

// BatchImportWorkflowRequest 工作流批量导入请求
type BatchImportWorkflowRequest struct {
	WorkflowFiles []WorkflowFileData `json:"workflow_files"` // 工作流文件数据列表
	SpaceID       string             `json:"space_id"`       // 工作空间ID
	CreatorID     string             `json:"creator_id"`     // 创建者ID
	ImportFormat  string             `json:"import_format"`  // 导入格式，支持 "json", "yml", "yaml", "zip", "mixed"
	ImportMode    string             `json:"import_mode"`    // 导入模式：batch(批量) 或 transaction(事务)
	base.Base
}

// WorkflowFileData 单个工作流文件数据
type WorkflowFileData struct {
	FileName     string `json:"file_name"`     // 文件名
	WorkflowData string `json:"workflow_data"` // 工作流数据（JSON或YAML格式）
	WorkflowName string `json:"workflow_name"` // 工作流名称
}

// BatchImportWorkflowResponse 工作流批量导入响应
type BatchImportWorkflowResponse struct {
	Code int64                    `json:"code"`
	Msg  string                   `json:"msg"`
	Data BatchImportResponseData `json:"data"`
	base.BaseResp
}

// BatchImportResponseData 批量导入响应数据
type BatchImportResponseData struct {
	TotalCount    int                          `json:"total_count"`              // 总数量
	SuccessCount  int                          `json:"success_count"`            // 成功数量
	FailedCount   int                          `json:"failed_count"`             // 失败数量
	SuccessList   []WorkflowImportResult       `json:"success_list,omitempty"`   // 成功列表
	FailedList    []WorkflowImportFailedResult `json:"failed_list,omitempty"`    // 失败列表
	ImportSummary ImportSummary                `json:"import_summary,omitempty"` // 导入摘要
}

// WorkflowImportResult 工作流导入成功结果
type WorkflowImportResult struct {
	FileName     string `json:"file_name"`     // 原文件名
	WorkflowName string `json:"workflow_name"` // 工作流名称
	WorkflowID   string `json:"workflow_id"`   // 新创建的工作流ID
	NodeCount    int    `json:"node_count"`    // 节点数量
	EdgeCount    int    `json:"edge_count"`    // 连接数量
}

// WorkflowImportFailedResult 工作流导入失败结果
type WorkflowImportFailedResult struct {
	FileName     string `json:"file_name"`     // 原文件名
	WorkflowName string `json:"workflow_name"` // 工作流名称
	ErrorCode    int64  `json:"error_code"`    // 错误码
	ErrorMessage string `json:"error_message"` // 错误信息
	FailReason   string `json:"fail_reason"`   // 失败原因分类
}

// ImportSummary 导入摘要
type ImportSummary struct {
	StartTime    int64                    `json:"start_time"`             // 开始时间
	EndTime      int64                    `json:"end_time"`               // 结束时间
	Duration     int64                    `json:"duration_ms"`            // 耗时（毫秒）
	ErrorStats   map[string]int           `json:"error_stats,omitempty"`  // 错误统计
	ImportConfig BatchImportConfig        `json:"import_config"`          // 导入配置
	ResourceInfo BatchImportResourceInfo  `json:"resource_info"`          // 资源信息
}

// BatchImportConfig 批量导入配置
type BatchImportConfig struct {
	ImportMode       string `json:"import_mode"`        // 导入模式
	MaxConcurrency   int    `json:"max_concurrency"`    // 最大并发数
	ContinueOnError  bool   `json:"continue_on_error"`  // 是否在出错时继续
	ValidateBeforeImport bool `json:"validate_before_import"` // 是否预先验证
}

// BatchImportResourceInfo 资源信息统计
type BatchImportResourceInfo struct {
	TotalFiles      int   `json:"total_files"`       // 总文件数
	TotalSize       int64 `json:"total_size_bytes"`  // 总大小（字节）
	TotalNodes      int   `json:"total_nodes"`       // 总节点数
	TotalEdges      int   `json:"total_edges"`       // 总连接数
	UniqueNodeTypes []string `json:"unique_node_types"` // 唯一节点类型
}

// BatchImportStatus 批量导入状态枚举
type BatchImportStatus string

const (
	BatchImportStatusPending    BatchImportStatus = "pending"     // 等待中
	BatchImportStatusProcessing BatchImportStatus = "processing"  // 处理中
	BatchImportStatusCompleted  BatchImportStatus = "completed"   // 已完成
	BatchImportStatusFailed     BatchImportStatus = "failed"      // 失败
)

// BatchImportMode 批量导入模式枚举
type BatchImportMode string

const (
	BatchImportModeBatch       BatchImportMode = "batch"       // 批量模式：允许部分失败
	BatchImportModeTransaction BatchImportMode = "transaction" // 事务模式：全部成功或全部失败
)

// FailReason 失败原因枚举
type FailReason string

const (
	FailReasonInvalidFormat   FailReason = "invalid_format"   // 格式错误
	FailReasonInvalidName     FailReason = "invalid_name"     // 名称错误
	FailReasonDuplicateName   FailReason = "duplicate_name"   // 名称重复
	FailReasonInvalidData     FailReason = "invalid_data"     // 数据错误
	FailReasonPermissionDenied FailReason = "permission_denied" // 权限不足
	FailReasonSystemError     FailReason = "system_error"     // 系统错误
)