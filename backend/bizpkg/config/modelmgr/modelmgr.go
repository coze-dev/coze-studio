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

package modelmgr

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/query"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
)

/*
-- Create 'model_instance' table
CREATE TABLE IF NOT EXISTS `model_instance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `type` tinyint NOT NULL COMMENT 'Model Type 0-LLM 1-TextEmbedding 2-Rerank ',
  `provider` json NOT NULL COMMENT 'Provider Information',
  `display_info` json NOT NULL COMMENT 'Display Information',
  `connection` json NOT NULL COMMENT 'Connection Information',
  `capability` json NOT NULL COMMENT 'Model Capability',
  `parameters` json NOT NULL COMMENT 'Model Parameters',
  `extra` json COMMENT 'Extra Information',
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
  `deleted_at` datetime(3) NULL COMMENT 'Delete Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Model Instance Management Table';

*/

type ModelConfig struct {
	oss           storage.Storage
	kv            *kvstore.KVStore[struct{}]
	ModelMetaConf *ModelMetaConf
}

const (
	doNotUseOldModelFlagKey        = "do_not_use_old_model_key"
	doNotUseOldModelFlagContextKey = "do_not_use_old_model_context_key"
)

func Init(ctx context.Context, db *gorm.DB, oss storage.Storage) (*ModelConfig, error) {
	query.SetDefault(db)

	// Init model meta conf
	mMetaConf, err := initModelMetaConf()
	if err != nil {
		return nil, err
	}

	c := &ModelConfig{
		oss:           oss,
		kv:            kvstore.New[struct{}](db),
		ModelMetaConf: mMetaConf,
	}

	// logs.CtxDebugf(ctx, "init model config, oss: %v, kv: %v, model_meta_conf: %v", oss, c.kv, c.ModelMetaConf)

	// init old model conf, dependent on model_meta_conf
	err = initOldModelConf(ctx, oss, c)
	if err != nil {
		return nil, err
	}

	return c, nil
}
