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

package repository

import (
	"context"
	"time"
	
	"gorm.io/gorm"
	
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/internal/dal"
)

// NewStatisticsRepo 创建统计仓储实例
func NewStatisticsRepo(db *gorm.DB) StatisticsRepo {
	return dal.NewStatisticsDAO(db)
}

type StatisticsRepo interface {
	// GetDailyMessageStats 获取每日消息统计（周期>24小时）
	GetDailyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyMessageStats, error)

	// GetHourlyMessageStats 获取每小时消息统计（周期<=24小时）
	GetHourlyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyMessageStats, error)

	// GetDailyActiveUsers 获取每日活跃用户数（周期>24小时）
	GetDailyActiveUsers(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyActiveUsersStats, error)

	// GetHourlyActiveUsers 获取每小时活跃用户数（周期<=24小时）
	GetHourlyActiveUsers(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyActiveUsersStats, error)

	// GetDailyAverageSessionInteractions 获取每日平均会话互动次数（周期>24小时）
	GetDailyAverageSessionInteractions(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAverageSessionInteractionsStats, error)

	// GetHourlyAverageSessionInteractions 获取每小时平均会话互动次数（周期<=24小时）
	GetHourlyAverageSessionInteractions(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAverageSessionInteractionsStats, error)

	// GetDailyTokenStats 获取每日Token统计（周期>24小时）
	GetDailyTokenStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAppTokensStats, error)

	// GetHourlyTokenStats 获取每小时Token统计（周期<=24小时）
	GetHourlyTokenStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAppTokensStats, error)

	// GetDailyTokensPerSecond 获取每日Token每秒吞吐量（周期>24小时）
	GetDailyTokensPerSecond(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAppTokensPerSecondStats, error)

	// GetHourlyTokensPerSecond 获取每小时Token每秒吞吐量（周期<=24小时）
	GetHourlyTokensPerSecond(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAppTokensPerSecondStats, error)

	// ListAppConversationLog 获取应用会话日志列表（支持分页）
	ListAppConversationLog(ctx context.Context, agentID int64, startTime, endTime time.Time, page, pageSize int32) (*entity.ListAppConversationLogResult, error)

	// ListConversationMessageLog 获取应用会话消息日志列表（支持分页）
	ListConversationMessageLog(ctx context.Context, agentID int64, conversationID int64, page, pageSize int32) (*entity.ListConversationMessageLogResult, error)
}