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
	"context"
	"time"

	"code.byted.org/data_edc/workflow_engine_next/infra/impl/tcc"
	"code.byted.org/gopkg/env"
	"code.byted.org/gopkg/logs"
	"code.byted.org/gorm/bytedgorm"
	"gorm.io/gorm"
)

type MySQLConfig struct {
	PSM          string `json:"psm"`            // 数据库 PSM
	DBName       string `json:"db_name"`        // 数据库名
	ReadTimeOut  int    `json:"read_timeout"`   // 数据库读超时时间, 单位秒
	MaxIdleConns int    `json:"max_idle_conns"` // 最大空闲连接数
	MaxOpenConns int    `json:"max_open_conns"` // 最大打开连接数
}

func New(ctx context.Context) (*gorm.DB, error) {
	c, err := getDBConfig(ctx)
	if err != nil {
		return nil, err
	}
	basicConfig := bytedgorm.MySQL(c.PSM, c.DBName).With(func(conf *bytedgorm.DBConfig) {
		// 通过 conf 选项可修改数据库连接的配置信息
		conf.ReadTimeout = time.Duration(c.ReadTimeOut) * time.Second
		// 开发机中指定机房
		if !env.InTCE() {
			conf.Cluster = "maliva"
		}
	})
	return gorm.Open(basicConfig,
		bytedgorm.ConnPool{MaxIdleConns: c.MaxIdleConns, MaxOpenConns: c.MaxOpenConns})
}

var mysqlConfigKey = "mysql_config"

func getDBConfig(ctx context.Context) (*MySQLConfig, error) {
	config, err := tcc.GetConfigByKey[MySQLConfig](ctx, tcc.Client(), mysqlConfigKey)
	if err != nil {
		return nil, err
	}
	logs.CtxInfo(ctx, "[GetDBConfig] get mysql config success, config:%v", config)
	return &config, nil
}
