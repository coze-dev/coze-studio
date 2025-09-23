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

package service

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	OSS        storage.Storage
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
	OAuthRepo  repository.OAuthRepository
}

func NewService(components *Components) PluginService {
	impl := &pluginServiceImpl{
		db:         components.DB,
		oss:        components.OSS,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
		oauthRepo:  components.OAuthRepo,
	}

	initOnce.Do(func() {
		ctx := context.Background()
		safego.Go(ctx, func() {
			impl.processOAuthAccessToken(ctx)
		})
	})

	return impl
}

type pluginServiceImpl struct {
	db         *gorm.DB
	oss        storage.Storage
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
	oauthRepo  repository.OAuthRepository
}
