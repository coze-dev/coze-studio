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

package es

import (
	"context"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/es"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/tcc"
	"code.byted.org/gopkg/logs"
)

type (
	Client          = es.Client
	Types           = es.Types
	BulkIndexer     = es.BulkIndexer
	BulkIndexerItem = es.BulkIndexerItem
	BoolQuery       = es.BoolQuery
	Query           = es.Query
	Response        = es.Response
	Request         = es.Request
)

type ESConfig struct {
	PSMWithCluster string `json:"psm_with_cluster"`
	Prefix         string `json:"prefix"`
}

func New(ctx context.Context) (Client, error) {
	config, err := getESConfig(ctx)
	if err != nil {
		return nil, err
	}

	cli, err := newByteES(config)
	if err != nil {
		return nil, err
	}
	return cli, nil
}

var esConfigKey = "es_config"

func getESConfig(ctx context.Context) (*ESConfig, error) {
	config, err := tcc.GetConfigByKey[ESConfig](ctx, tcc.Client(), esConfigKey)
	if err != nil {
		return nil, err
	}
	logs.CtxInfo(ctx, "[getESConfig] get es config success, config:%v", config)
	return &config, nil
}
