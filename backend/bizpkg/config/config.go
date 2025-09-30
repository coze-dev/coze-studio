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

type BasicConfiguration = config.BasicConfiguration

func Base() *base.BaseConfig {
	return shardConfig.base
}

func Knowledge() *knowledge.KnowledgeConfig {
	return shardConfig.knowledge
}

func ModelConf() *modelmgr.ModelConfig {
	return shardConfig.model
}
