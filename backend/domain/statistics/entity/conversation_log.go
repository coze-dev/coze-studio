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

// PaginationInfo 分页信息
type PaginationInfo struct {
	Page       int32 `json:"page"`        // 当前页码
	PageSize   int32 `json:"page_size"`   // 页面大小
	Total      int64 `json:"total"`       // 总记录数
	TotalPages int32 `json:"total_pages"` // 总页数
}

// ListAppConversationLogRequest 获取应用会话日志列表请求
type ListAppConversationLogRequest struct {
	AgentID   int64     `json:"agent_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Page      *int32    `json:"page"`      // 可选，页码，默认1
	PageSize  *int32    `json:"page_size"` // 可选，页面大小，默认20
}

// ListAppConversationLogResponse 获取应用会话日志列表响应
type ListAppConversationLogResponse struct {
	CreateTime        string `json:"create_time"`
	User              string `json:"user"`
	ConversationName  string `json:"conversation_name"`
	MessageCount      int64  `json:"message_count"`
	AppConversationID int64  `json:"app_conversation_id"`
	CreateTimestamp   int64  `json:"create_timestamp"`
}

// ListAppConversationLogResult 分页查询结果
type ListAppConversationLogResult struct {
	Data       []*ListAppConversationLogResponse `json:"data"`
	Pagination *PaginationInfo                   `json:"pagination"`
}