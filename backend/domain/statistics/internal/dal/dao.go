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

package dal

import (
	"context"
	"encoding/json"
	"sort"
	"time"

	"gorm.io/gorm"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/entity"
	"github.com/coze-dev/coze-studio/backend/domain/statistics/internal/dal/query"
)

type StatisticsDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewStatisticsDAO(db *gorm.DB) *StatisticsDAO {
	return &StatisticsDAO{
		db:    db,
		query: query.Use(db),
	}
}

// GetDailyMessageStats 实现每日统计查询
func (dao *StatisticsDAO) GetDailyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyMessageStats, error) {
	var results []*entity.DailyMessageStats

	// 构建SQL查询
	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d') as date,
			COUNT(1) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetHourlyMessageStats 实现每小时统计查询
func (dao *StatisticsDAO) GetHourlyMessageStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyMessageStats, error) {
	var results []*entity.HourlyMessageStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H') as date,
			COUNT(1) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetDailyActiveUsers 获取每日活跃用户数（按conversation_id去重）
func (dao *StatisticsDAO) GetDailyActiveUsers(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyActiveUsersStats, error) {
	var results []*entity.DailyActiveUsersStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d') as date,
			COUNT(DISTINCT conversation_id) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetHourlyActiveUsers 获取每小时活跃用户数（按conversation_id去重）
func (dao *StatisticsDAO) GetHourlyActiveUsers(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyActiveUsersStats, error) {
	var results []*entity.HourlyActiveUsersStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H') as date,
			COUNT(DISTINCT conversation_id) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetDailyAverageSessionInteractions 获取每日平均会话互动次数（周期>24小时）
func (dao *StatisticsDAO) GetDailyAverageSessionInteractions(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAverageSessionInteractionsStats, error) {
	var results []*entity.DailyAverageSessionInteractionsStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d') as date,
			ROUND(COUNT(id)/COUNT(DISTINCT conversation_id), 2) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetHourlyAverageSessionInteractions 获取每小时平均会话互动次数（周期<=24小时）
func (dao *StatisticsDAO) GetHourlyAverageSessionInteractions(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAverageSessionInteractionsStats, error) {
	var results []*entity.HourlyAverageSessionInteractionsStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H') as date,
			ROUND(COUNT(id)/COUNT(DISTINCT conversation_id), 2) as count
		FROM message
		WHERE message_type <> 'verbose'
			AND agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetDailyTokenStats 获取每日Token统计（周期>24小时）
func (dao *StatisticsDAO) GetDailyTokenStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAppTokensStats, error) {
	var results []*entity.DailyAppTokensStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d') as date,
			SUM(IF(JSON_EXTRACT(ext, '$.input_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.input_tokens') AS SIGNED))) as input_tokens,
			SUM(IF(JSON_EXTRACT(ext, '$.output_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.output_tokens') AS SIGNED))) as output_tokens,
			SUM(IF(JSON_EXTRACT(ext, '$.token') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.token') AS SIGNED))) as total_tokens
		FROM message
		WHERE agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetHourlyTokenStats 获取每小时Token统计（周期<=24小时）
func (dao *StatisticsDAO) GetHourlyTokenStats(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAppTokensStats, error) {
	var results []*entity.HourlyAppTokensStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H') as date,
			SUM(IF(JSON_EXTRACT(ext, '$.input_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.input_tokens') AS SIGNED))) as input_tokens,
			SUM(IF(JSON_EXTRACT(ext, '$.output_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.output_tokens') AS SIGNED))) as output_tokens,
			SUM(IF(JSON_EXTRACT(ext, '$.token') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.token') AS SIGNED))) as total_tokens
		FROM message
		WHERE agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetDailyTokensPerSecond 获取每日Token每秒吞吐量统计（周期>24小时）
func (dao *StatisticsDAO) GetDailyTokensPerSecond(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.DailyAppTokensPerSecondStats, error) {
	var results []*entity.DailyAppTokensPerSecondStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d') as date,
			ROUND(SUM(IF(JSON_EXTRACT(ext, '$.output_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.output_tokens') AS SIGNED)))/SUM(IF(JSON_EXTRACT(ext, '$.time_cost') IS NULL, 0, JSON_EXTRACT(ext, '$.time_cost'))), 2) as count
		FROM message
		WHERE agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
			AND JSON_EXTRACT(ext, '$.output_tokens') IS NOT NULL
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// GetHourlyTokensPerSecond 获取每小时Token每秒吞吐量统计（周期<=24小时）
func (dao *StatisticsDAO) GetHourlyTokensPerSecond(ctx context.Context, agentID int64, startTime, endTime time.Time) ([]*entity.HourlyAppTokensPerSecondStats, error) {
	var results []*entity.HourlyAppTokensPerSecondStats

	sql := `
		SELECT 
			agent_id,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H') as date,
			ROUND(SUM(IF(JSON_EXTRACT(ext, '$.output_tokens') IS NULL, 0, CAST(JSON_EXTRACT(ext, '$.output_tokens') AS SIGNED)))/SUM(IF(JSON_EXTRACT(ext, '$.time_cost') IS NULL, 0, JSON_EXTRACT(ext, '$.time_cost'))), 2) as count
		FROM message
		WHERE agent_id = ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
			AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
			AND JSON_EXTRACT(ext, '$.output_tokens') IS NOT NULL
		GROUP BY agent_id, date
		ORDER BY date
	`

	err := dao.db.WithContext(ctx).Raw(sql,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&results).Error

	return results, err
}

// ListAppConversationLog 获取应用会话日志列表（支持分页）
func (dao *StatisticsDAO) ListAppConversationLog(ctx context.Context, agentID int64, startTime, endTime time.Time, page, pageSize int32) (*entity.ListAppConversationLogResult, error) {
	// 设置默认值
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询总数
	countSQL := `
		SELECT COUNT(*) as total
		FROM (
			SELECT
				id,
				creator_id,
				created_at,
				name,
				scene
			FROM conversation
			WHERE agent_id = ?
				AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
				AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		) t1
		LEFT JOIN (
			SELECT
				conversation_id,
				COUNT(DISTINCT run_id) as message_count
			FROM message
			WHERE message_type <> 'verbose'
			GROUP BY conversation_id
		) t3 ON t1.id = t3.conversation_id
		WHERE t3.message_count IS NOT NULL
	`

	var total int64
	err := dao.db.WithContext(ctx).Raw(countSQL,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
	).Scan(&total).Error
	if err != nil {
		return nil, err
	}

	// 查询分页数据
	var results []*entity.ListAppConversationLogResponse
	dataSQL := `
		SELECT
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(t1.created_at / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H:%i:%s') as create_time,
			t2.name as user,
			IF(t1.name IS NULL OR t1.name='','新的会话',t1.name) as conversation_name,
			t3.message_count as message_count,
			t1.id as app_conversation_id,
			t1.created_at as create_timestamp
		FROM (
			SELECT
				id,
				creator_id,
				created_at,
				name,
				scene
			FROM conversation
			WHERE agent_id = ?
				AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') >= ?
				AND CONVERT_TZ(FROM_UNIXTIME(created_at / 1000),'UTC','Asia/Shanghai') <= ?
		) t1
		LEFT JOIN (
			SELECT
				id,
				name
			FROM user
		) t2 ON t1.creator_id = t2.id
		LEFT JOIN (
			SELECT
				conversation_id,
				COUNT(DISTINCT run_id) as message_count
			FROM message
			WHERE message_type <> 'verbose'
			GROUP BY conversation_id
		) t3 ON t1.id = t3.conversation_id
		WHERE t3.message_count IS NOT NULL
		ORDER BY t1.created_at DESC
		LIMIT ? OFFSET ?
	`

	err = dao.db.WithContext(ctx).Raw(dataSQL,
		agentID,
		startTime.Format("2006-01-02 15:04:05"),
		endTime.Format("2006-01-02 15:04:05"),
		pageSize,
		offset,
	).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	// 计算总页数
	totalPages := int32((total + int64(pageSize) - 1) / int64(pageSize))

	// 构建分页结果
	result := &entity.ListAppConversationLogResult{
		Data: results,
		Pagination: &entity.PaginationInfo{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	return result, nil
}

// ListConversationMessageLog 获取会话消息历史日志列表
func (dao *StatisticsDAO) ListConversationMessageLog(ctx context.Context, agentID int64, conversationID int64, page, pageSize int32) (*entity.ListConversationMessageLogResult, error) {
	// 设置默认分页参数
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	// 查询总数
	countSQL := `
		SELECT COUNT(DISTINCT run_id)
		FROM message
		WHERE message_type <> 'verbose'
		AND agent_id = ? AND conversation_id = ?
	`

	var total int64
	err := dao.db.WithContext(ctx).Raw(countSQL, agentID, conversationID).Scan(&total).Error
	if err != nil {
		return nil, err
	}

	// 查询消息历史数据
	type messageLogResult struct {
		ConversationID int64  `json:"conversation_id"`
		RunID          int64  `json:"run_id"`
		Result         string `json:"result"` // JSON字符串
		Token          int64  `json:"token"`
		TimeCost       float64 `json:"time_cost"`
		CreateTime     string `json:"create_time"`
	}

	var rawResults []*messageLogResult
	dataSQL := `
		SELECT
			conversation_id,
			run_id,
			JSON_OBJECT(
				'query', MAX(CASE WHEN message_type = 'question' THEN content END),
				'answer', MAX(CASE WHEN message_type = 'answer' THEN content END)
			) AS result,
			SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.token'),0)) AS token,
			ROUND(SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.time_cost'),0)),2) AS time_cost,
			DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(MIN(created_at) / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H:%i:%s') AS create_time
		FROM message
		WHERE message_type <> 'verbose'
		AND agent_id = ? AND conversation_id = ?
		GROUP BY conversation_id, run_id
		ORDER BY MIN(created_at) DESC
		LIMIT ? OFFSET ?
	`

	err = dao.db.WithContext(ctx).Raw(dataSQL,
		agentID,
		conversationID,
		pageSize,
		offset,
	).Scan(&rawResults).Error
	if err != nil {
		return nil, err
	}

	// 转换为目标格式
	var results []*entity.ListConversationMessageLogData
	for _, raw := range rawResults {
		// 解析JSON字符串为MessageContent
		var messageContent entity.MessageContent
		err := json.Unmarshal([]byte(raw.Result), &messageContent)
		if err != nil {
			return nil, err
		}

		// 如果answer为null，设为空字符串
		if messageContent.Answer == nil {
			emptyAnswer := ""
			messageContent.Answer = &emptyAnswer
		}

		results = append(results, &entity.ListConversationMessageLogData{
			ConversationID: raw.ConversationID,
			RunID:          raw.RunID,
			Message:        &messageContent,
			Tokens:         raw.Token,
			TimeCost:       raw.TimeCost,
			CreateTime:     raw.CreateTime,
		})
	}

	// 查询统计数据 - 获取原始数据用于Go中计算
	statsSQL := `
		SELECT
			SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.token'),0)) AS total_token,
			SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.time_cost'),0)) AS total_time_cost
		FROM message
		WHERE message_type <> 'verbose'
		AND agent_id = ? AND conversation_id = ?
		GROUP BY run_id
		ORDER BY total_token, total_time_cost
	`

	var statsResults []*statsData
	err = dao.db.WithContext(ctx).Raw(statsSQL, agentID, conversationID).Scan(&statsResults).Error
	if err != nil {
		return nil, err
	}

	// 在Go中计算统计信息
	stats := dao.calculateMessageStatistics(statsResults)

	// 计算总页数
	totalPages := int32((total + int64(pageSize) - 1) / int64(pageSize))

	// 构建分页结果
	result := &entity.ListConversationMessageLogResult{
		Data:       results,
		Statistics: stats,
		Pagination: &entity.PaginationInfo{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	return result, nil
}

// statsData 用于统计计算的数据结构
type statsData struct {
	TotalToken    int64   `json:"total_token"`
	TotalTimeCost float64 `json:"total_time_cost"`
}

// calculateMessageStatistics 计算消息统计信息
func (dao *StatisticsDAO) calculateMessageStatistics(statsResults []*statsData) *entity.MessageStatistics {
	if len(statsResults) == 0 {
		return &entity.MessageStatistics{
			MessageCount: 0,
			TokensP50:    0,
			LatencyP50:   0,
			LatencyP99:   0,
		}
	}

	// 提取token和latency数据
	tokens := make([]int64, len(statsResults))
	latencies := make([]float64, len(statsResults))

	for i, data := range statsResults {
		tokens[i] = data.TotalToken
		latencies[i] = data.TotalTimeCost
	}

	// 排序数据
	sort.Slice(tokens, func(i, j int) bool { return tokens[i] < tokens[j] })
	sort.Slice(latencies, func(i, j int) bool { return latencies[i] < latencies[j] })

	// 计算百分位数
	messageCount := int64(len(statsResults))
	tokensP50 := calculatePercentile(tokens, 0.5)
	latencyP50 := calculatePercentileFloat(latencies, 0.5)
	latencyP99 := calculatePercentileFloat(latencies, 0.99)

	return &entity.MessageStatistics{
		MessageCount: messageCount,
		TokensP50:    tokensP50,
		LatencyP50:   latencyP50,
		LatencyP99:   latencyP99,
	}
}

// calculatePercentile 计算整数切片的百分位数
func calculatePercentile(data []int64, percentile float64) int64 {
	if len(data) == 0 {
		return 0
	}
	if len(data) == 1 {
		return data[0]
	}

	index := percentile * float64(len(data)-1)
	lower := int(index)
	upper := lower + 1

	if upper >= len(data) {
		return data[len(data)-1]
	}

	weight := index - float64(lower)
	return int64(float64(data[lower])*(1-weight) + float64(data[upper])*weight)
}

// calculatePercentileFloat 计算浮点数切片的百分位数
func calculatePercentileFloat(data []float64, percentile float64) float64 {
	if len(data) == 0 {
		return 0
	}
	if len(data) == 1 {
		return data[0]
	}

	index := percentile * float64(len(data)-1)
	lower := int(index)
	upper := lower + 1

	if upper >= len(data) {
		return data[len(data)-1]
	}

	weight := index - float64(lower)
	return data[lower]*(1-weight) + data[upper]*weight
}

// ListAppMessageWithConLog 获取应用会话和消息日志列表
func (dao *StatisticsDAO) ListAppMessageWithConLog(ctx context.Context, agentID int64, page, pageSize int32) (*entity.ListAppMessageWithConLogResult, error) {
	// 设置默认分页参数
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	// 查询总数
	countSQL := `
		SELECT COUNT(*)
		FROM (
			SELECT
				t1.id
			FROM (
				SELECT
					id,
					creator_id,
					created_at,
					name
				FROM conversation
				WHERE agent_id = ?
			) t1
			LEFT JOIN (
				SELECT
					conversation_id,
					run_id
				FROM message
				WHERE message_type <> 'verbose'
				GROUP BY conversation_id, run_id
			) t3
			ON t1.id=t3.conversation_id
			WHERE t3.run_id IS NOT NULL
		) AS total_count
	`

	var total int64
	err := dao.db.WithContext(ctx).Raw(countSQL, agentID).Scan(&total).Error
	if err != nil {
		return nil, err
	}

	// 查询主数据
	type rawResult struct {
		ConversationID   int64   `db:"conversation_id"`
		User             string  `db:"user"`
		ConversationName string  `db:"ConversationName"`
		RunID            int64   `db:"run_id"`
		Result           string  `db:"result"` // JSON字符串
		CreateTime       string  `db:"CreateTime"`
		Token            int64   `db:"token"`
		TimeCost         float64 `db:"time_cost"`
	}

	var rawResults []*rawResult
	dataSQL := `
		SELECT
			t1.id AS conversation_id,
			t2.name as user,
			IF(t1.name IS NULL OR t1.name='','新的会话',t1.name) as ConversationName,
			t3.run_id,
			t3.result,
			t3.CreateTime,
			t3.token,
			t3.time_cost
		FROM (
			SELECT
				id,
				creator_id,
				created_at,
				name
			FROM conversation
			WHERE agent_id = ?
		) t1
		LEFT JOIN (
			SELECT
				id,
				name
			FROM user
		) t2
		ON t1.creator_id=t2.id
		LEFT JOIN (
			SELECT
				conversation_id,
				run_id,
				JSON_OBJECT(
					'query', MAX(CASE WHEN message_type = 'question' THEN content END),
					'answer', MAX(CASE WHEN message_type = 'answer' THEN content END)
				) AS result,
				SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.token'),0)) as token,
				ROUND(SUM(IF(message_type = 'answer',JSON_EXTRACT(ext, '$.time_cost'),0)),2) as time_cost,
				DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(MIN(created_at) / 1000),'UTC','Asia/Shanghai'),'%Y-%m-%d %H:%i:%s') as CreateTime
			FROM message
			WHERE message_type <> 'verbose'
			GROUP BY conversation_id, run_id
		) t3
		ON t1.id=t3.conversation_id
		WHERE t3.run_id IS NOT NULL
		ORDER BY t1.created_at DESC
		LIMIT ? OFFSET ?
	`

	err = dao.db.WithContext(ctx).Raw(dataSQL,
		agentID,
		pageSize,
		offset,
	).Scan(&rawResults).Error
	if err != nil {
		return nil, err
	}

	// 转换为目标格式
		var results []*entity.ListAppMessageWithConLogData
	for _, raw := range rawResults {
		// 解析JSON字符串为MessageContent
		var messageContent entity.MessageContent
		err := json.Unmarshal([]byte(raw.Result), &messageContent)
		if err != nil {
			return nil, err
		}

		// 如果answer为null，设为空字符串
		if messageContent.Answer == nil {
			emptyAnswer := ""
			messageContent.Answer = &emptyAnswer
		}

		results = append(results, &entity.ListAppMessageWithConLogData{
			ConversationID:   raw.ConversationID,
			User:             raw.User,
			ConversationName: raw.ConversationName,
			RunID:            raw.RunID,
			Message:          &messageContent,
			CreateTime:       raw.CreateTime,
			Tokens:           raw.Token,
			TimeCost:         raw.TimeCost,
		})
	}

	// 计算总页数
	totalPages := int32((total + int64(pageSize) - 1) / int64(pageSize))

	// 构建分页结果
	result := &entity.ListAppMessageWithConLogResult{
		Data: results,
		Pagination: &entity.PaginationInfo{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	return result, nil
}
