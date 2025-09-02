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