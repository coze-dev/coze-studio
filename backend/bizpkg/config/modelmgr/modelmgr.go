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
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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
	oss storage.Storage
	kv  *kvstore.KVStore[struct{}]
}

const (
	doNotUseOldModelFlagKey        = "do_not_use_old_model_key"
	doNotUseOldModelFlagContextKey = "do_not_use_old_model_context_key"
)

func NewModelConfig(db *gorm.DB, oss storage.Storage, idGenSVC idgen.IDGenerator) *ModelConfig {
	query.SetDefault(db)

	return &ModelConfig{
		oss: oss,
		kv:  kvstore.New[struct{}](db),
	}
}

func (c *ModelConfig) UseOldModelConf(ctx context.Context) (bool, error) {
	useOldModelList, ok := ctxcache.Get[bool](ctx, doNotUseOldModelFlagContextKey)
	if ok {
		return useOldModelList, nil
	}

	_, err := c.kv.Get(ctx, consts.ModelConfigSpace, doNotUseOldModelFlagKey)
	if err != nil {
		if errors.Is(err, kvstore.ErrKeyNotFound) {
			logs.CtxInfof(ctx, "[UseOldModelConf] will use old model")
			ctxcache.Store(ctx, doNotUseOldModelFlagContextKey, true)
			return true, nil
		}

		return false, err
	}

	ctxcache.Store(ctx, doNotUseOldModelFlagContextKey, false)
	return false, nil
}

func (c *ModelConfig) SetDoNotUseOldModelConf(ctx context.Context) error {
	useOldModelList, err := c.UseOldModelConf(ctx)
	if err != nil {
		logs.CtxWarnf(ctx, "set use new model list failed, err: %v , will try to set use new model flag", err)
	}

	if useOldModelList {
		return c.kv.Save(ctx, consts.ModelConfigSpace, doNotUseOldModelFlagKey, &struct{}{})
	}

	return nil
}
