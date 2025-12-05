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

package mysql

import (
	"fmt"
	"os"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func New() (*gorm.DB, error) {
	dsn := os.Getenv("MYSQL_DSN")
	db, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		return nil, fmt.Errorf("mysql open, dsn: %s, err: %w", dsn, err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		logs.Errorf("InitDB. db.DB() fail. err:%v", err)
		return nil, err
	}

	// 连接池配置
	sqlDB.SetMaxIdleConns(envkey.GetIntD("MYSQL_MAX_IDLE_CONNS", 10))
	sqlDB.SetMaxOpenConns(envkey.GetIntD("MYSQL_MAX_OPEN_CONNS", 100))
	sqlDB.SetConnMaxLifetime(time.Duration(envkey.GetIntD("MYSQL_CONN_MAX_LIFETIME", 3600)) * time.Second)
	sqlDB.SetConnMaxIdleTime(time.Duration(envkey.GetIntD("MYSQL_CONN_MAX_IDLE_TIME", 600)) * time.Second)

	return db, nil
}
