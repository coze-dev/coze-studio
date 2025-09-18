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
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/url"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/statistics"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/repository"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/xuri/excelize/v2"
)

type StatisticsApp struct {
	statisticsService            service.Statistics
	storage                      storage.Storage
	defaultExportTTL             time.Duration
	defaultDownloadExpireSeconds int64
}

const (
	defaultExportRetentionHours    = 72
	defaultDownloadURLExpireSecond = 600
	exportTimeLayout               = "2006-01-02 15:04:05"
)

func NewStatisticsApp(db *gorm.DB, storageClient storage.Storage) *StatisticsApp {
	// 创建Repository
	repo := repository.NewStatisticsRepo(db)

	// 创建Service
	statisticsService := service.NewStatisticsService(repo)

	return &StatisticsApp{
		statisticsService:            statisticsService,
		storage:                      storageClient,
		defaultExportTTL:             time.Duration(defaultExportRetentionHours) * time.Hour,
		defaultDownloadExpireSeconds: defaultDownloadURLExpireSecond,
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

// ListAppConversationLog 获取应用会话日志列表（支持分页）
func (app *StatisticsApp) ListAppConversationLog(ctx context.Context, req *statistics.ListAppConversationLogRequest) (*statistics.ListAppConversationLogResponse, error) {
	// 转换请求参数
	domainReq := &entity.ListAppConversationLogRequest{
		AgentID:   req.AgentID,
		StartTime: time.UnixMilli(req.StartTime),
		EndTime:   time.UnixMilli(req.EndTime),
		Page:      req.Page,
		PageSize:  req.PageSize,
	}

	// 调用domain service
	result, err := app.statisticsService.ListAppConversationLog(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	// 转换响应
	resp := &statistics.ListAppConversationLogResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.ListAppConversationLogData, 0, len(result.Data)),
	}

	// 转换数据
	for _, data := range result.Data {
		resp.Data = append(resp.Data, &statistics.ListAppConversationLogData{
			CreateTime:        data.CreateTime,
			User:              data.User,
			ConversationName:  data.ConversationName,
			MessageCount:      data.MessageCount,
			AppConversationID: data.AppConversationID,
			CreateTimestamp:   data.CreateTimestamp,
		})
	}

	// 设置分页信息
	if result.Pagination != nil {
		resp.Pagination = &statistics.PaginationInfo{
			Page:       result.Pagination.Page,
			PageSize:   result.Pagination.PageSize,
			Total:      result.Pagination.Total,
			TotalPages: result.Pagination.TotalPages,
		}
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

// ListConversationMessageLog 获取会话消息历史日志列表
func (app *StatisticsApp) ListConversationMessageLog(ctx context.Context, req *statistics.ListConversationMessageLogRequest) (*statistics.ListConversationMessageLogResponse, error) {
	// 转换请求参数
	domainReq := &entity.ListConversationMessageLogRequest{
		AgentID:        req.AgentID,
		ConversationID: req.ConversationID,
		Page:           req.Page,
		PageSize:       req.PageSize,
	}

	// 调用domain service
	result, err := app.statisticsService.ListConversationMessageLog(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	// 转换响应数据
	resp := &statistics.ListConversationMessageLogResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.ListConversationMessageLogData, 0, len(result.Data)),
	}

	// 转换消息数据
	for _, data := range result.Data {
		messageContent := &statistics.MessageContent{
			Query:  data.Message.Query,
			Answer: data.Message.Answer,
		}

		resp.Data = append(resp.Data, &statistics.ListConversationMessageLogData{
			ConversationID: data.ConversationID,
			RunID:          data.RunID,
			Message:        messageContent,
			Tokens:         data.Tokens,
			TimeCost:       data.TimeCost,
			CreateTime:     data.CreateTime,
		})
	}

	// 转换统计信息
	if result.Statistics != nil {
		resp.Statistics = &statistics.MessageStatistics{
			MessageCount: result.Statistics.MessageCount,
			TokensP50:    result.Statistics.TokensP50,
			LatencyP50:   result.Statistics.LatencyP50,
			LatencyP99:   result.Statistics.LatencyP99,
		}
	}

	// 转换分页信息
	if result.Pagination != nil {
		resp.Pagination = &statistics.PaginationInfo{
			Page:       result.Pagination.Page,
			PageSize:   result.Pagination.PageSize,
			Total:      result.Pagination.Total,
			TotalPages: result.Pagination.TotalPages,
		}
	}

	return resp, nil
}

// ListAppMessageWithConLog 获取应用会话和消息日志列表
func (app *StatisticsApp) ListAppMessageWithConLog(ctx context.Context, req *statistics.ListAppMessageWithConLogRequest) (*statistics.ListAppMessageWithConLogResponse, error) {
	// 转换请求参数
	domainReq := &entity.ListAppMessageWithConLogRequest{
		AgentID:  req.AgentID,
		Page:     req.Page,
		PageSize: req.PageSize,
	}

	// 调用domain service
	result, err := app.statisticsService.ListAppMessageWithConLog(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	// 转换响应数据
	resp := &statistics.ListAppMessageWithConLogResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.ListAppMessageWithConLogData, 0, len(result.Data)),
	}

	// 转换消息数据
	for _, data := range result.Data {
		messageContent := &statistics.MessageContent{
			Query:  data.Message.Query,
			Answer: data.Message.Answer,
		}

		resp.Data = append(resp.Data, &statistics.ListAppMessageWithConLogData{
			ConversationID:   data.ConversationID,
			User:             data.User,
			ConversationName: data.ConversationName,
			RunID:            data.RunID,
			Message:          messageContent,
			CreateTime:       data.CreateTime,
			Tokens:           data.Tokens,
			TimeCost:         data.TimeCost,
		})
	}

	// 转换分页信息
	if result.Pagination != nil {
		resp.Pagination = &statistics.PaginationInfo{
			Page:       result.Pagination.Page,
			PageSize:   result.Pagination.PageSize,
			Total:      result.Pagination.Total,
			TotalPages: result.Pagination.TotalPages,
		}
	}

	return resp, nil
}

// ExportConversationMessageLog 导出会话消息日志
func (app *StatisticsApp) ExportConversationMessageLog(ctx context.Context, req *statistics.ExportConversationMessageLogRequest) (*statistics.ExportConversationMessageLogResponse, error) {
	fileName := req.GetFileName()
	if fileName == "" {
		fileName = fmt.Sprintf("conversation_message_log_%d.xlsx", time.Now().Unix())
	}

	domainReq := &entity.ExportConversationMessageLogRequest{
		AgentID:  req.AgentID,
		FileName: fileName,
	}

	if app.storage == nil {
		return nil, fmt.Errorf("storage client not configured")
	}

	if len(req.ConversationIds) > 0 {
		domainReq.ConversationIDs = append(domainReq.ConversationIDs, req.ConversationIds...)
	}
	if len(req.RunIds) > 0 {
		domainReq.RunIDs = append(domainReq.RunIDs, req.RunIds...)
	}

	result, err := app.statisticsService.ExportConversationMessageLog(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	if result.FileName != "" {
		fileName = result.FileName
	}

	excelFile := excelize.NewFile()
	defer func() { _ = excelFile.Close() }()

	sheetName := "Logs"
	excelFile.SetSheetName("Sheet1", sheetName)

	headers := []string{"会话名称", "会话创建时间", "用户", "消息时间", "问题", "回答", "Token 消耗", "耗时（秒）", "会话ID", "Run ID"}
	for idx, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(idx+1, 1)
		if err := excelFile.SetCellValue(sheetName, cell, header); err != nil {
			return nil, err
		}
	}

	for rowIdx, data := range result.Data {
		rowNumber := rowIdx + 2
		values := []interface{}{
			data.ConversationName,
			data.ConversationCreatedTime,
			data.User,
			data.MessageCreatedTime,
			data.Query,
			data.Answer,
			data.Tokens,
			data.TimeCost,
			data.ConversationID,
			data.RunID,
		}

		for colIdx, value := range values {
			cell, _ := excelize.CoordinatesToCellName(colIdx+1, rowNumber)
			if err := excelFile.SetCellValue(sheetName, cell, value); err != nil {
				return nil, err
			}
		}
	}

	var buf bytes.Buffer
	if _, err := excelFile.WriteTo(&buf); err != nil {
		return nil, err
	}

	now := time.Now().In(entity.ExportTimeLocation)
	retention := app.defaultExportTTL
	if req.IsSetExpireHours() && req.GetExpireHours() > 0 {
		retention = time.Duration(req.GetExpireHours()) * time.Hour
	}
	expireAt := now.Add(retention)

	exportTaskID := uuid.NewString()
	objectKey := fmt.Sprintf("statistics/exports/%d/%s.xlsx", req.AgentID, exportTaskID)
	contentDisposition := fmt.Sprintf("attachment; filename*=UTF-8''%s", url.PathEscape(fileName))

	if err := app.storage.PutObject(ctx, objectKey, buf.Bytes(),
		storage.WithContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
		storage.WithContentDisposition(contentDisposition),
		storage.WithExpires(expireAt)); err != nil {
		return nil, err
	}

	_, err = app.statisticsService.CreateConversationExportFile(ctx, &entity.CreateConversationExportFileRequest{
		AgentID:      req.AgentID,
		ExportTaskID: exportTaskID,
		FileName:     fileName,
		ObjectKey:    objectKey,
		ExpireAt:     expireAt,
		Status:       entity.ExportFileStatusSuccess,
		CreatedAt:    now,
	})
	if err != nil {
		return nil, err
	}

	resp := &statistics.ExportConversationMessageLogResponse{
		Code: 0,
		Msg:  "success",
	}
	resp.ExportTaskID = &exportTaskID

	return resp, nil
}

// ListExportConversationFiles 查看导出的会话消息日志文件列表
func (app *StatisticsApp) ListExportConversationFiles(ctx context.Context, req *statistics.ListExportConversationFilesRequest) (*statistics.ListExportConversationFilesResponse, error) {
	domainReq := &entity.ListConversationExportFilesRequest{
		AgentID:  req.AgentID,
		Page:     req.Page,
		PageSize: req.PageSize,
	}

	result, err := app.statisticsService.ListConversationExportFiles(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	resp := &statistics.ListExportConversationFilesResponse{
		Code: 0,
		Msg:  "success",
		Data: make([]*statistics.ExportedConversationFileInfo, 0, len(result.Data)),
	}

	for _, item := range result.Data {
		resp.Data = append(resp.Data, &statistics.ExportedConversationFileInfo{
			ExportTaskID: item.ExportTaskID,
			FileName:     item.FileName,
			ObjectKey:    item.ObjectKey,
			CreatedAt:    item.CreatedAt.In(entity.ExportTimeLocation).Format(exportTimeLayout),
			ExpireAt:     item.ExpireAt.In(entity.ExportTimeLocation).Format(exportTimeLayout),
			Status:       item.Status,
		})
	}

	if result.Pagination != nil {
		resp.Pagination = &statistics.PaginationInfo{
			Page:       result.Pagination.Page,
			PageSize:   result.Pagination.PageSize,
			Total:      result.Pagination.Total,
			TotalPages: result.Pagination.TotalPages,
		}
	}

	return resp, nil
}

// GetExportConversationFileDownloadUrl 获取导出文件的下载链接
func (app *StatisticsApp) GetExportConversationFileDownloadUrl(ctx context.Context, req *statistics.GetExportConversationFileDownloadUrlRequest) (*statistics.GetExportConversationFileDownloadUrlResponse, error) {
	domainReq := &entity.GetConversationExportFileRequest{
		AgentID:      req.AgentID,
		ExportTaskID: req.ExportTaskID,
	}

	if app.storage == nil {
		return nil, fmt.Errorf("storage client not configured")
	}

	record, err := app.statisticsService.GetConversationExportFile(ctx, domainReq)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &statistics.GetExportConversationFileDownloadUrlResponse{
				Code: 404,
				Msg:  "export file not found or expired",
			}, nil
		}
		return nil, err
	}

	if record.ExpireAt.Before(time.Now().In(entity.ExportTimeLocation)) {
		return &statistics.GetExportConversationFileDownloadUrlResponse{
			Code: 410,
			Msg:  "export file expired",
		}, nil
	}

	if record.Status != entity.ExportFileStatusSuccess {
		return &statistics.GetExportConversationFileDownloadUrlResponse{
			Code: 409,
			Msg:  "export task not ready",
		}, nil
	}

	downloadExpire := app.defaultDownloadExpireSeconds
	if req.IsSetExpireSeconds() && req.GetExpireSeconds() > 0 {
		downloadExpire = int64(req.GetExpireSeconds())
	}

	urlStr, err := app.storage.GetObjectUrl(ctx, record.ObjectKey, storage.WithExpire(downloadExpire))
	if err != nil {
		return nil, err
	}
	fileURL := urlStr

	resp := &statistics.GetExportConversationFileDownloadUrlResponse{
		Code: 0,
		Msg:  "success",
	}
	resp.FileURL = &fileURL

	return resp, nil
}
