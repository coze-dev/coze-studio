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
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config/base"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/knowledge"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

type Config struct {
	base      *base.BaseConfig
	knowledge *knowledge.KnowledgeConfig
	model     *modelmgr.ModelConfig
}

var shardConfig *Config

func Init(db *gorm.DB, oss storage.Storage, idGenSVC idgen.IDGenerator) error {
	shardConfig = &Config{
		base:      base.NewBaseConfig(db),
		knowledge: knowledge.NewKnowledgeConfig(db),
		model:     modelmgr.NewModelConfig(db, oss, idGenSVC),
	}

	// init old model conf
	if err := modelmgr.InitOldModelConf(db.Statement.Context, oss); err != nil {
		return err
	}

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
