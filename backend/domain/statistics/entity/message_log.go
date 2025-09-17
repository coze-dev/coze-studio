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

package entity

import "time"

// MessageContent 消息内容结构
type MessageContent struct {
	Query  string  `json:"query"`            // 用户查询
	Answer *string `json:"answer,omitempty"` // AI回答，可选
}

// ListConversationMessageLogRequest 获取会话消息历史请求
type ListConversationMessageLogRequest struct {
	AgentID        int64  `json:"agent_id"`
	ConversationID int64  `json:"conversation_id"`
	Page           *int32 `json:"page"`      // 可选，页码，默认1
	PageSize       *int32 `json:"page_size"` // 可选，页面大小，默认20
}

// ListConversationMessageLogData 会话消息历史数据
type ListConversationMessageLogData struct {
	ConversationID int64           `json:"conversation_id"`
	RunID          int64           `json:"run_id"`
	Message        *MessageContent `json:"message"`
	Tokens         int64           `json:"tokens"`
	TimeCost       float64         `json:"time_cost"`
	CreateTime     string          `json:"create_time"` // 日期格式
}

// MessageStatistics 消息统计信息
type MessageStatistics struct {
	MessageCount int64   `json:"message_count"` // 消息总数
	TokensP50    int64   `json:"tokens_p50"`    // Token数量P50
	LatencyP50   float64 `json:"latency_p50"`   // 延迟P50
	LatencyP99   float64 `json:"latency_p99"`   // 延迟P99
}

// ListConversationMessageLogResponse 会话消息历史响应
type ListConversationMessageLogResponse struct {
	Data       []*ListConversationMessageLogData `json:"data"`
	Statistics *MessageStatistics                `json:"statistics"`
	Pagination *PaginationInfo                   `json:"pagination,omitempty"` // 分页信息，可选
}

// ListConversationMessageLogResult 分页查询结果
type ListConversationMessageLogResult struct {
	Data       []*ListConversationMessageLogData `json:"data"`
	Statistics *MessageStatistics                `json:"statistics"`
	Pagination *PaginationInfo                   `json:"pagination"`
}

// ListAppMessageWithConLogRequest 获取应用会话和消息日志请求
type ListAppMessageWithConLogRequest struct {
	AgentID  int64  `json:"agent_id"`
	Page     *int32 `json:"page"`      // 可选，页码，默认1
	PageSize *int32 `json:"page_size"` // 可选，页面大小，默认20
}

// ListAppMessageWithConLogData 应用会话和消息日志数据
type ListAppMessageWithConLogData struct {
	ConversationID   int64           `json:"conversation_id"`
	User             string          `json:"user"`
	ConversationName string          `json:"conversation_name"`
	RunID            int64           `json:"run_id"`
	Message          *MessageContent `json:"message"`
	CreateTime       string          `json:"create_time"`
	Tokens           int64           `json:"tokens"`
	TimeCost         float64         `json:"time_cost"`
}

// ListAppMessageWithConLogResponse 应用会话和消息日志响应
type ListAppMessageWithConLogResponse struct {
	Data       []*ListAppMessageWithConLogData `json:"data"`
	Pagination *PaginationInfo                 `json:"pagination,omitempty"` // 分页信息，可选
}

// ListAppMessageWithConLogResult 分页查询结果
type ListAppMessageWithConLogResult struct {
	Data       []*ListAppMessageWithConLogData `json:"data"`
	Pagination *PaginationInfo                 `json:"pagination"`
}

// ExportConversationMessageLogRequest 导出会话消息日志请求
type ExportConversationMessageLogRequest struct {
	AgentID         int64   `json:"agent_id"`
	FileName        string  `json:"file_name"`
	ConversationIDs []int64 `json:"conversation_ids,omitempty"`
	RunIDs          []int64 `json:"run_ids,omitempty"`
}

// ExportConversationMessageLogData 导出会话消息日志数据
type ExportConversationMessageLogData struct {
	ConversationID          int64   `json:"conversation_id"`
	RunID                   int64   `json:"run_id"`
	ConversationName        string  `json:"conversation_name"`
	ConversationCreatedTime string  `json:"conversation_created_time"`
	User                    string  `json:"user"`
	MessageCreatedTime      string  `json:"message_created_time"`
	Query                   string  `json:"query"`
	Answer                  string  `json:"answer"`
	Tokens                  int64   `json:"tokens"`
	TimeCost                float64 `json:"time_cost"`
}

// ExportConversationMessageLogResult 导出会话消息日志结果
type ExportConversationMessageLogResult struct {
	FileName string                              `json:"file_name"`
	Data     []*ExportConversationMessageLogData `json:"data"`
}

const (
	ExportFileStatusPending int32 = 0
	ExportFileStatusSuccess int32 = 1
	ExportFileStatusFailed  int32 = 2
)

var ExportTimeLocation = time.FixedZone("CST", 8*3600)

// ConversationExportFile 导出的文件记录
type ConversationExportFile struct {
	ID           int64     `json:"id"`
	AgentID      int64     `json:"agent_id"`
	ExportTaskID string    `json:"export_task_id"`
	FileName     string    `json:"file_name"`
	ObjectKey    string    `json:"object_key"`
	CreatedAt    time.Time `json:"created_at"`
	ExpireAt     time.Time `json:"expire_at"`
	Status       int32     `json:"status"`
}

// CreateConversationExportFileRequest 创建导出文件记录请求
type CreateConversationExportFileRequest struct {
	AgentID      int64
	ExportTaskID string
	FileName     string
	ObjectKey    string
	ExpireAt     time.Time
	Status       int32
	CreatedAt    time.Time
}

// ListConversationExportFilesRequest 查询导出文件列表请求
type ListConversationExportFilesRequest struct {
	AgentID  int64
	Page     *int32
	PageSize *int32
}

// ListConversationExportFilesResult 查询导出文件列表结果
type ListConversationExportFilesResult struct {
	Data       []*ConversationExportFile `json:"data"`
	Pagination *PaginationInfo           `json:"pagination"`
}

// GetConversationExportFileRequest 查询单个导出文件请求
type GetConversationExportFileRequest struct {
	AgentID      int64
	ExportTaskID string
}
