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
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
)

// MockStatisticsRepo 模拟Repository
type MockStatisticsRepo struct {
	mock.Mock
}

// GetDailyMessageStats 模拟获取每日消息统计
func (m *MockStatisticsRepo) GetDailyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyMessageStats, error) {
	args := m.Called(ctx, agentID, startTime, endTime)
	if args.Get(0) != nil {
		return args.Get(0).([]*entity.DailyMessageStats), args.Error(1)
	}
	return nil, args.Error(1)
}

// GetHourlyMessageStats 模拟获取每小时消息统计
func (m *MockStatisticsRepo) GetHourlyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyMessageStats, error) {
	args := m.Called(ctx, agentID, startTime, endTime)
	if args.Get(0) != nil {
		return args.Get(0).([]*entity.HourlyMessageStats), args.Error(1)
	}
	return nil, args.Error(1)
}

// GetDailyActiveUsersStats 模拟获取每日活跃用户统计
func (m *MockStatisticsRepo) GetDailyActiveUsersStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyActiveUsersStats, error) {
	args := m.Called(ctx, agentID, startTime, endTime)
	if args.Get(0) != nil {
		return args.Get(0).([]*entity.DailyActiveUsersStats), args.Error(1)
	}
	return nil, args.Error(1)
}

// GetHourlyActiveUsersStats 模拟获取每小时活跃用户统计
func (m *MockStatisticsRepo) GetHourlyActiveUsersStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyActiveUsersStats, error) {
	args := m.Called(ctx, agentID, startTime, endTime)
	if args.Get(0) != nil {
		return args.Get(0).([]*entity.HourlyActiveUsersStats), args.Error(1)
	}
	return nil, args.Error(1)
}

func TestGetAppDailyMessages(t *testing.T) {
	ctx := context.Background()
	
	t.Run("DailyStats_WhenPeriodGreaterThan24Hours", func(t *testing.T) {
		// 准备测试数据
		mockRepo := new(MockStatisticsRepo)
		service := NewService(&Components{
			StatisticsRepo: mockRepo,
		})
		
		agentID := int64(7535655495097384960)
		startTime := time.Date(2025, 8, 20, 15, 0, 0, 0, time.UTC)
		endTime := time.Date(2025, 8, 23, 0, 0, 0, 0, time.UTC)
		
		expectedStats := []*entity.DailyMessageStats{
			{
				AgentID: agentID,
				Date:    "2025-08-20",
				Count:   100,
			},
			{
				AgentID: agentID,
				Date:    "2025-08-21",
				Count:   150,
			},
			{
				AgentID: agentID,
				Date:    "2025-08-22",
				Count:   200,
			},
		}
		
		// 设置mock期望
		mockRepo.On("GetDailyMessageStats", ctx, agentID, startTime, endTime).
			Return(expectedStats, nil)
		
		// 执行测试
		req := &entity.GetAppDailyMessagesRequest{
			AgentID:   agentID,
			StartTime: startTime,
			EndTime:   endTime,
		}
		
		responses, err := service.GetAppDailyMessages(ctx, req)
		
		// 打印返回的数据
		t.Logf("返回的响应数量: %d", len(responses))
		for i, resp := range responses {
			t.Logf("响应[%d]: AgentID=%d, Date=%s, Count=%d", 
				i, resp.AgentID, resp.Date, resp.Count)
		}
		
		// 断言
		assert.NoError(t, err)
		assert.NotNil(t, responses)
		assert.Len(t, responses, 3)
		
		// 验证返回数据
		for i, resp := range responses {
			assert.Equal(t, expectedStats[i].AgentID, resp.AgentID)
			assert.Equal(t, expectedStats[i].Date, resp.Date)
			assert.Equal(t, expectedStats[i].Count, resp.Count)
		}
		
		// 验证mock调用
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("HourlyStats_WhenPeriodLessThanOrEqual24Hours", func(t *testing.T) {
		// 准备测试数据
		mockRepo := new(MockStatisticsRepo)
		service := NewService(&Components{
			StatisticsRepo: mockRepo,
		})
		
		agentID := int64(7535655495097384960)
		startTime := time.Date(2025, 8, 21, 0, 0, 0, 0, time.UTC)
		endTime := time.Date(2025, 8, 22, 0, 0, 0, 0, time.UTC)
		
		expectedStats := []*entity.HourlyMessageStats{
			{
				AgentID: agentID,
				Date:    "2025-08-21 00",
				Count:   10,
			},
			{
				AgentID: agentID,
				Date:    "2025-08-21 01",
				Count:   15,
			},
			{
				AgentID: agentID,
				Date:    "2025-08-21 02",
				Count:   20,
			},
		}
		
		// 设置mock期望
		mockRepo.On("GetHourlyMessageStats", ctx, agentID, startTime, endTime).
			Return(expectedStats, nil)
		
		// 执行测试
		req := &entity.GetAppDailyMessagesRequest{
			AgentID:   agentID,
			StartTime: startTime,
			EndTime:   endTime,
		}
		
		responses, err := service.GetAppDailyMessages(ctx, req)
		
		// 打印返回的数据
		t.Logf("返回的响应数量: %d", len(responses))
		for i, resp := range responses {
			t.Logf("响应[%d]: AgentID=%d, Date=%s, Count=%d", 
				i, resp.AgentID, resp.Date, resp.Count)
		}
		
		// 断言
		assert.NoError(t, err)
		assert.NotNil(t, responses)
		assert.Len(t, responses, 3)
		
		// 验证返回数据
		for i, resp := range responses {
			assert.Equal(t, expectedStats[i].AgentID, resp.AgentID)
			assert.Equal(t, expectedStats[i].Date, resp.Date)
			assert.Equal(t, expectedStats[i].Count, resp.Count)
		}
		
		// 验证mock调用
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("ErrorHandling_WhenRepositoryReturnsError", func(t *testing.T) {
		// 准备测试数据
		mockRepo := new(MockStatisticsRepo)
		service := NewService(&Components{
			StatisticsRepo: mockRepo,
		})
		
		agentID := int64(7535655495097384960)
		startTime := time.Date(2025, 8, 20, 0, 0, 0, 0, time.UTC)
		endTime := time.Date(2025, 8, 23, 0, 0, 0, 0, time.UTC)
		
		expectedError := assert.AnError
		
		// 设置mock期望
		mockRepo.On("GetDailyMessageStats", ctx, agentID, startTime, endTime).
			Return(nil, expectedError)
		
		// 执行测试
		req := &entity.GetAppDailyMessagesRequest{
			AgentID:   agentID,
			StartTime: startTime,
			EndTime:   endTime,
		}
		
		responses, err := service.GetAppDailyMessages(ctx, req)
		
		// 打印错误信息
		t.Logf("返回的错误: %v", err)
		t.Logf("响应是否为nil: %v", responses == nil)
		
		// 断言
		assert.Error(t, err)
		assert.Equal(t, expectedError, err)
		assert.Nil(t, responses)
		
		// 验证mock调用
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("EmptyResult_WhenNoDataFound", func(t *testing.T) {
		// 准备测试数据
		mockRepo := new(MockStatisticsRepo)
		service := NewService(&Components{
			StatisticsRepo: mockRepo,
		})
		
		agentID := int64(7535655495097384960)
		startTime := time.Date(2025, 8, 20, 0, 0, 0, 0, time.UTC)
		endTime := time.Date(2025, 8, 21, 0, 0, 0, 0, time.UTC)
		
		// 设置mock期望 - 返回空数组
		mockRepo.On("GetHourlyMessageStats", ctx, agentID, startTime, endTime).
			Return([]*entity.HourlyMessageStats{}, nil)
		
		// 执行测试
		req := &entity.GetAppDailyMessagesRequest{
			AgentID:   agentID,
			StartTime: startTime,
			EndTime:   endTime,
		}
		
		responses, err := service.GetAppDailyMessages(ctx, req)
		
		// 打印空结果情况
		t.Logf("空结果测试 - 返回的响应数量: %d", len(responses))
		t.Logf("响应是否为nil: %v", responses == nil)
		
		// 断言
		assert.NoError(t, err)
		assert.NotNil(t, responses)
		assert.Len(t, responses, 0)
		
		// 验证mock调用
		mockRepo.AssertExpectations(t)
	})
}