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

package appinfra

import (
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/modelmgr/database"
)

// initModelMgr 初始化数据库模型管理器
// 注意：这个函数在 Init() 中被调用，此时 DB 和 Redis 已经初始化
func initModelMgr(db *gorm.DB, redisClient cache.Cmdable) (modelmgr.Manager, error) {
	// 创建数据库模型管理器
	mgr, err := database.NewModelMgr(db, redisClient)
	if err != nil {
		return nil, err
	}

	return mgr, nil
}
