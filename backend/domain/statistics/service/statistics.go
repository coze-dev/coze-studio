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

package service

import (
	"context"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/repository"
)

// NewStatisticsService 创建统计服务实例
func NewStatisticsService(repo repository.StatisticsRepo) Statistics {
	return NewService(&Components{
		StatisticsRepo: repo,
	})
}

// Statistics 统计服务接口
type Statistics interface {
	// GetAppDailyMessages 获取应用每日消息统计
	GetAppDailyMessages(ctx context.Context, req *entity.GetAppDailyMessagesRequest) ([]*entity.GetAppDailyMessagesResponse, error)

	// GetAppDailyActiveUsers 获取应用每日活跃用户统计
	GetAppDailyActiveUsers(ctx context.Context, req *entity.GetAppDailyActiveUsersRequest) ([]*entity.GetAppDailyActiveUsersResponse, error)

	// GetAppAverageSessionInteractions 获取应用平均会话互动数
	GetAppAverageSessionInteractions(ctx context.Context, req *entity.GetAppAverageSessionInteractionsRequest) ([]*entity.GetAppAverageSessionInteractionsResponse, error)

	// GetAppTokens 获取应用Token使用统计
	GetAppTokens(ctx context.Context, req *entity.GetAppTokensRequest) ([]*entity.GetAppTokensResponse, error)

	// GetAppTokensPerSecond 获取应用Token每秒吞吐量统计
	GetAppTokensPerSecond(ctx context.Context, req *entity.GetAppTokensPerSecondRequest) ([]*entity.GetAppTokensPerSecondResponse, error)

	// ListAppConversationLog 获取应用会话日志列表（支持分页）
	ListAppConversationLog(ctx context.Context, req *entity.ListAppConversationLogRequest) (*entity.ListAppConversationLogResult, error)

	// ListConversationMessageLog 获取会话消息历史日志列表（支持分页）
	ListConversationMessageLog(ctx context.Context, req *entity.ListConversationMessageLogRequest) (*entity.ListConversationMessageLogResult, error)

	// ListAppMessageWithConLog 获取应用会话和消息日志列表（支持分页）
	ListAppMessageWithConLog(ctx context.Context, req *entity.ListAppMessageWithConLogRequest) (*entity.ListAppMessageWithConLogResult, error)

	// ExportConversationMessageLog 导出会话消息日志数据
	ExportConversationMessageLog(ctx context.Context, req *entity.ExportConversationMessageLogRequest) (*entity.ExportConversationMessageLogResult, error)

	// CreateConversationExportFile 创建导出文件记录
	CreateConversationExportFile(ctx context.Context, req *entity.CreateConversationExportFileRequest) (*entity.ConversationExportFile, error)

	// ListConversationExportFiles 查询导出文件列表
	ListConversationExportFiles(ctx context.Context, req *entity.ListConversationExportFilesRequest) (*entity.ListConversationExportFilesResult, error)

	// GetConversationExportFile 获取单个导出文件记录
	GetConversationExportFile(ctx context.Context, req *entity.GetConversationExportFileRequest) (*entity.ConversationExportFile, error)
}
