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

// GetAppDailyMessagesRequest 
type GetAppDailyMessagesRequest struct {
	AgentID   int64     `json:"agent_id"`   
	StartTime time.Time `json:"start_time"` 
	EndTime   time.Time `json:"end_time"`   
}

type DailyMessageStats struct {
	AgentID int64  `json:"agent_id"`
	Date    string `json:"date"`  // 格式: "2025-08-20"
	Count   int64  `json:"count"` 
}

type HourlyMessageStats struct {
	AgentID int64  `json:"agent_id"`
	Date    string `json:"date"`  // 格式: "2025-08-20 15"
	Count   int64  `json:"count"` 
}

type GetAppDailyMessagesResponse struct {
	AgentID    int64         `json:"agent_id"`
	Date  string `json:"date"`  // 日期或日期时间
	Count int64  `json:"count"` 
}

// GetAppDailyActiveUsersRequest 
type GetAppDailyActiveUsersRequest struct {
	AgentID   int64     `json:"agent_id"`   
	StartTime time.Time `json:"start_time"` 
	EndTime   time.Time `json:"end_time"`   
}

type DailyActiveUsersStats struct {
	AgentID int64  `json:"agent_id"`
	Date    string `json:"date"`  // 格式: "2025-08-20"
	Count   int64  `json:"count"` 
}

type HourlyActiveUsersStats struct {
	AgentID int64  `json:"agent_id"`
	Date    string `json:"date"`  // 格式: "2025-08-20 15"
	Count   int64  `json:"count"` 
}

type GetAppDailyActiveUsersResponse struct {
	AgentID    int64         `json:"agent_id"`
	Date  string `json:"date"`  // 日期或日期时间
	Count int64  `json:"count"` 
}

// GetAppAverageSessionInteractions
type GetAppAverageSessionInteractionsRequest struct {
	AgentID   int64     `json:"agent_id"`   
	StartTime time.Time `json:"start_time"` 
	EndTime   time.Time `json:"end_time"`   
}

type DailyAverageSessionInteractionsStats struct {
	AgentID int64   `json:"agent_id"`
	Date    string  `json:"date"`  // 格式: "2025-08-20"
	Count   float64 `json:"count"` // 平均值，使用float64
}

type HourlyAverageSessionInteractionsStats struct {
	AgentID int64   `json:"agent_id"`
	Date    string  `json:"date"`  // 格式: "2025-08-20 15"
	Count   float64 `json:"count"` // 平均值，使用float64
}

type GetAppAverageSessionInteractionsResponse struct {
	AgentID int64   `json:"agent_id"`
	Date    string  `json:"date"`  // 日期或日期时间
	Count   float64 `json:"count"` // 平均值，使用float64
}

// GetAppTokens
type GetAppTokensRequest struct {
	AgentID   int64     `json:"agent_id"`   
	StartTime time.Time `json:"start_time"` 
	EndTime   time.Time `json:"end_time"`   
}

type DailyAppTokensStats struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 格式: "2025-08-20"
	InputTokens  int64  `json:"input_tokens"`
	OutputTokens int64  `json:"output_tokens"`
	TotalTokens  int64  `json:"total_tokens"`
}

type HourlyAppTokensStats struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 格式: "2025-08-20 15"
	InputTokens  int64  `json:"input_tokens"`
	OutputTokens int64  `json:"output_tokens"`
	TotalTokens  int64  `json:"total_tokens"`
}

type GetAppTokensResponse struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 日期或日期时间
	InputTokens  int64  `json:"input_tokens"`
	OutputTokens int64  `json:"output_tokens"`
	TotalTokens  int64  `json:"total_tokens"`
}

// GetAppTokensPerSecond
type GetAppTokensPerSecondRequest struct {
	AgentID   int64     `json:"agent_id"`   
	StartTime time.Time `json:"start_time"` 
	EndTime   time.Time `json:"end_time"`   
}

type DailyAppTokensPerSecondStats struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 格式: "2025-08-20"
	Count        float64 `json:"count"`
}

type HourlyAppTokensPerSecondStats struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 格式: "2025-08-20 15"
	Count        float64 `json:"count"`
}

type GetAppTokensPerSecondResponse struct {
	AgentID      int64  `json:"agent_id"`
	Date         string `json:"date"`  // 日期或日期时间
	Count        float64 `json:"count"`
}
