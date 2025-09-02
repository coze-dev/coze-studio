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

// statisticsImpl 统计服务实现
type statisticsImpl struct {
	Components
}

// Components 依赖组件
type Components struct {
	StatisticsRepo repository.StatisticsRepo
}

// NewService 创建统计服务实例
func NewService(c *Components) Statistics {
	return &statisticsImpl{
		Components: *c,
	}
}

// GetAppDailyMessages 实现获取应用每日消息统计
func (s *statisticsImpl) GetAppDailyMessages(ctx context.Context, req *entity.GetAppDailyMessagesRequest) ([]*entity.GetAppDailyMessagesResponse, error) {
	duration := req.EndTime.Sub(req.StartTime)
	
	// 初始化为空数组而不是nil
	responses := make([]*entity.GetAppDailyMessagesResponse, 0)

	// 根据时间范围决定统计粒度
	if duration.Hours() > 24 {
		// 周期大于24小时，按天统计
		stats, err := s.StatisticsRepo.GetDailyMessageStats(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppDailyMessagesResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	} else {
		// 周期小于等于24小时，按小时统计
		stats, err := s.StatisticsRepo.GetHourlyMessageStats(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppDailyMessagesResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	}

	return responses, nil
}

// GetAppDailyActiveUsers 实现获取应用每日活跃用户统计
func (s *statisticsImpl) GetAppDailyActiveUsers(ctx context.Context, req *entity.GetAppDailyActiveUsersRequest) ([]*entity.GetAppDailyActiveUsersResponse, error) {
	duration := req.EndTime.Sub(req.StartTime)
	
	// 初始化为空数组而不是nil
	responses := make([]*entity.GetAppDailyActiveUsersResponse, 0)

	// 根据时间范围决定统计粒度
	if duration.Hours() > 24 {
		// 周期大于24小时，按天统计
		stats, err := s.StatisticsRepo.GetDailyActiveUsers(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppDailyActiveUsersResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	} else {
		// 周期小于等于24小时，按小时统计
		stats, err := s.StatisticsRepo.GetHourlyActiveUsers(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppDailyActiveUsersResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	}

	return responses, nil
}

// GetAppAverageSessionInteractions 实现获取应用平均会话互动数
func (s *statisticsImpl) GetAppAverageSessionInteractions(ctx context.Context, req *entity.GetAppAverageSessionInteractionsRequest) ([]*entity.GetAppAverageSessionInteractionsResponse, error) {
	duration := req.EndTime.Sub(req.StartTime)
	
	// 初始化为空数组而不是nil
	responses := make([]*entity.GetAppAverageSessionInteractionsResponse, 0)

	// 根据时间范围决定统计粒度
	if duration.Hours() > 24 {
		// 周期大于24小时，按天统计
		stats, err := s.StatisticsRepo.GetDailyAverageSessionInteractions(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppAverageSessionInteractionsResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	} else {
		// 周期小于等于24小时，按小时统计
		stats, err := s.StatisticsRepo.GetHourlyAverageSessionInteractions(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppAverageSessionInteractionsResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	}

	return responses, nil
}

// GetAppTokens 实现获取应用Token使用统计
func (s *statisticsImpl) GetAppTokens(ctx context.Context, req *entity.GetAppTokensRequest) ([]*entity.GetAppTokensResponse, error) {
	duration := req.EndTime.Sub(req.StartTime)
	
	// 初始化为空数组而不是nil
	responses := make([]*entity.GetAppTokensResponse, 0)

	// 根据时间范围决定统计粒度
	if duration.Hours() > 24 {
		// 周期大于24小时，按天统计
		stats, err := s.StatisticsRepo.GetDailyTokenStats(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppTokensResponse{
				AgentID:      stat.AgentID,
				Date:         stat.Date,
				InputTokens:  stat.InputTokens,
				OutputTokens: stat.OutputTokens,
				TotalTokens:  stat.TotalTokens,
			})
		}
	} else {
		// 周期小于等于24小时，按小时统计
		stats, err := s.StatisticsRepo.GetHourlyTokenStats(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppTokensResponse{
				AgentID:      stat.AgentID,
				Date:         stat.Date,
				InputTokens:  stat.InputTokens,
				OutputTokens: stat.OutputTokens,
				TotalTokens:  stat.TotalTokens,
			})
		}
	}

	return responses, nil
}

// GetAppTokensPerSecond 实现获取应用Token每秒吞吐量统计
func (s *statisticsImpl) GetAppTokensPerSecond(ctx context.Context, req *entity.GetAppTokensPerSecondRequest) ([]*entity.GetAppTokensPerSecondResponse, error) {
	duration := req.EndTime.Sub(req.StartTime)
	
	// 初始化为空数组而不是nil
	responses := make([]*entity.GetAppTokensPerSecondResponse, 0)

	// 根据时间范围决定统计粒度
	if duration.Hours() > 24 {
		// 周期大于24小时，按天统计
		stats, err := s.StatisticsRepo.GetDailyTokensPerSecond(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppTokensPerSecondResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	} else {
		// 周期小于等于24小时，按小时统计
		stats, err := s.StatisticsRepo.GetHourlyTokensPerSecond(ctx, req.AgentID, req.StartTime, req.EndTime)
		if err != nil {
			return nil, err
		}

		for _, stat := range stats {
			responses = append(responses, &entity.GetAppTokensPerSecondResponse{
				AgentID: stat.AgentID,
				Date:    stat.Date,
				Count:   stat.Count,
			})
		}
	}

	return responses, nil
}