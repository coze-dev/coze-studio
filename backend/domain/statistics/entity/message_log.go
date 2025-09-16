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