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

package statistics

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/statistics"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/repository"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/service"
)

type StatisticsApp struct {
	statisticsService service.Statistics
}

func NewStatisticsApp(db *gorm.DB) *StatisticsApp {
	// 创建Repository
	repo := repository.NewStatisticsRepo(db)
	
	// 创建Service
	statisticsService := service.NewStatisticsService(repo)
	
	return &StatisticsApp{
		statisticsService: statisticsService,
	}
}

// GetAppDailyMessages 获取应用每日消息统计
func (app *StatisticsApp) GetAppDailyMessages(ctx context.Context, req *statistics.GetAppDailyMessagesRequest) (*statistics.GetAppDailyMessagesResponse, error) {
	// 转换请求参数
	domainReq := &entity.GetAppDailyMessagesRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
	}
	
	// 调用domain service
	results, err := app.statisticsService.GetAppDailyMessages(ctx, domainReq)
	if err != nil {
		return nil, err
	}
	
	// 转换响应
	resp := &statistics.GetAppDailyMessagesResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.MessageStatData, 0, len(results)),
	}
	
	for _, result := range results {
		resp.Data = append(resp.Data, &statistics.MessageStatData{
			AgentID: result.AgentID,
			Date:    result.Date,
			Count:   result.Count,
		})
	}
	
	return resp, nil
}

// GetAppDailyActiveUsers 获取应用每日活跃用户统计
func (app *StatisticsApp) GetAppDailyActiveUsers(ctx context.Context, req *statistics.GetAppDailyActiveUsersRequest) (*statistics.GetAppDailyActiveUsersResponse, error) {
	// 转换请求参数
	domainReq := &entity.GetAppDailyActiveUsersRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
	}
	
	// 调用domain service
	results, err := app.statisticsService.GetAppDailyActiveUsers(ctx, domainReq)
	if err != nil {
		return nil, err
	}
	
	// 转换响应
	resp := &statistics.GetAppDailyActiveUsersResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.ActiveUsersStatData, 0, len(results)),
	}
	
	for _, result := range results {
		resp.Data = append(resp.Data, &statistics.ActiveUsersStatData{
			AgentID: result.AgentID,
			Date:    result.Date,
			Count:   result.Count,
		})
	}
	
	return resp, nil
}

// GetAppAverageSessionInteractions 获取应用平均会话互动数统计
func (app *StatisticsApp) GetAppAverageSessionInteractions(ctx context.Context, req *statistics.GetAppAverageSessionInteractionsRequest) (*statistics.GetAppAverageSessionInteractionsResponse, error) {
	// 转换请求参数
	domainReq := &entity.GetAppAverageSessionInteractionsRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
	}
	
	// 调用domain service
	results, err := app.statisticsService.GetAppAverageSessionInteractions(ctx, domainReq)
	if err != nil {
		return nil, err
	}
	
	// 转换响应
	resp := &statistics.GetAppAverageSessionInteractionsResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.AverageSessionInteractionsData, 0, len(results)),
	}
	
	for _, result := range results {
		resp.Data = append(resp.Data, &statistics.AverageSessionInteractionsData{
			AgentID: result.AgentID,
			Date:    result.Date,
			Count:   result.Count,
		})
	}
	
	return resp, nil
}

// GetAppTokens 获取应用Token使用统计
func (app *StatisticsApp) GetAppTokens(ctx context.Context, req *statistics.GetAppTokensRequest) (*statistics.GetAppTokensResponse, error) {
	// 转换请求参数
	domainReq := &entity.GetAppTokensRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
	}
	
	// 调用domain service
	results, err := app.statisticsService.GetAppTokens(ctx, domainReq)
	if err != nil {
		return nil, err
	}
	
	// 转换响应
	resp := &statistics.GetAppTokensResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.TokenStatData, 0, len(results)),
	}
	
	for _, result := range results {
		resp.Data = append(resp.Data, &statistics.TokenStatData{
			AgentID:      result.AgentID,
			Date:         result.Date,
			InputTokens:  result.InputTokens,
			OutputTokens: result.OutputTokens,
			TotalTokens:  result.TotalTokens,
		})
	}
	
	return resp, nil
}

// GetAppTokensPerSecond 获取应用Token每秒吞吐量统计
func (app *StatisticsApp) GetAppTokensPerSecond(ctx context.Context, req *statistics.GetAppTokensPerSecondRequest) (*statistics.GetAppTokensPerSecondResponse, error) {
	// 转换请求参数
	domainReq := &entity.GetAppTokensPerSecondRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
	}
	
	// 调用domain service
	results, err := app.statisticsService.GetAppTokensPerSecond(ctx, domainReq)
	if err != nil {
		return nil, err
	}
	
	// 转换响应
	resp := &statistics.GetAppTokensPerSecondResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.TokensPerSecondData, 0, len(results)),
	}
	
	for _, result := range results {
		resp.Data = append(resp.Data, &statistics.TokensPerSecondData{
			AgentID: result.AgentID,
			Date:    result.Date,
			Count:   result.Count,
		})
	}
	
	return resp, nil
}