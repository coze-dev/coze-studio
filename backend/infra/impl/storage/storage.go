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

package storage

import (
	"context"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/imagex"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/storage/tos"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/tcc"
	"code.byted.org/gopkg/logs"
)

type Storage = storage.Storage

type TOSConfig struct {
	SourcePSM   string `json:"source_psm"`
	BucketName  string `json:"bucket_name"`
	AK          string `json:"ak"`
	Region      string `json:"region"`
	BaseURL     string `json:"base_url"`      // 内网可以访问的域名前缀
	ProdBaseURL string `json:"prod_base_url"` // 生产网可以访问的域名前缀
}

func New(ctx context.Context) (Storage, error) {
	config, err := getRedisConfig(ctx)
	if err != nil {
		return nil, err
	}
	return tos.New(
		ctx,
		config.BucketName,
		config.AK,
		config.Region,
		config.SourcePSM,
	)
}

func NewImagex(ctx context.Context) (imagex.ImageX, error) {
	config, err := getRedisConfig(ctx)
	if err != nil {
		return nil, err
	}
	return tos.NewStorageImagex(
		ctx,
		config.SourcePSM,
		config.AK,
		config.Region,
		config.SourcePSM,
	)
}

var tosConfigKey = "tos_config"

func getRedisConfig(ctx context.Context) (*TOSConfig, error) {
	config, err := tcc.GetConfigByKey[TOSConfig](ctx, tcc.Client(), tosConfigKey)
	if err != nil {
		return nil, err
	}
	logs.CtxInfo(ctx, "[GetTOSConfig] get tos config success, config:%v", config)
	return &config, nil
}
