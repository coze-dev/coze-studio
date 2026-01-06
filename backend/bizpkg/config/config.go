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

package config

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/base"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/knowledge"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

type BasicConfiguration = config.BasicConfiguration
type ModelStatus = config.ModelStatus

const (
	// Default state when not configured, equivalent to StatusInUse
	ModelStatus_StatusDefault ModelStatus = 0
	// In the application, it can be used to create new
	ModelStatus_StatusInUse ModelStatus = 1
	// It is offline, unusable, and cannot be created.
	ModelStatus_StatusDeleted ModelStatus = 2
)

type EmbeddingType = config.EmbeddingType

const (
	EmbeddingType_Ark    EmbeddingType = 0
	EmbeddingType_OpenAI EmbeddingType = 1
	EmbeddingType_Ollama EmbeddingType = 2
	EmbeddingType_Gemini EmbeddingType = 3
	EmbeddingType_HTTP   EmbeddingType = 4
)

type Config struct {
	base      *base.BaseConfig
	knowledge *knowledge.KnowledgeConfig
	model     *modelmgr.ModelConfig
}

var shardConfig *Config

func Init(ctx context.Context, db *gorm.DB, oss storage.Storage) error {
	shardConfig = &Config{
		base:      base.NewBaseConfig(db),
		knowledge: knowledge.NewKnowledgeConfig(db),
	}

	m, err := modelmgr.Init(ctx, db, oss)
	if err != nil {
		return err
	}

	shardConfig.model = m

	return nil
}

func Base() *base.BaseConfig {
	return shardConfig.base
}

func Knowledge() *knowledge.KnowledgeConfig {
	return shardConfig.knowledge
}

func ModelConf() *modelmgr.ModelConfig {
	return shardConfig.model
}
