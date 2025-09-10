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

package repository

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/entity"
)

// DocumentMemoryRepository 文档记忆Repository接口
type DocumentMemoryRepository interface {
	// GetUserMemoryDocument 根据用户ID和连接器ID获取记忆文档
	GetUserMemoryDocument(ctx context.Context, userID string, connectorID int64) (*entity.UserMemoryDocument, error)

	// CreateOrUpdateUserMemoryDocument 创建或更新用户记忆文档
	CreateOrUpdateUserMemoryDocument(ctx context.Context, document *entity.UserMemoryDocument) error

	// GetUserMemoryConfig 获取用户记忆配置
	GetUserMemoryConfig(ctx context.Context, userID string, connectorID int64) (*entity.UserMemoryConfig, error)

	// CreateOrUpdateUserMemoryConfig 创建或更新用户记忆配置
	CreateOrUpdateUserMemoryConfig(ctx context.Context, config *entity.UserMemoryConfig) error

	// DeleteUserMemoryDocument 删除用户记忆文档
	DeleteUserMemoryDocument(ctx context.Context, userID string, connectorID int64) error
}