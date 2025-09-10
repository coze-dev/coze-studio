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

package impl

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// DocumentMemoryRepositoryImpl 文档记忆Repository实现
type DocumentMemoryRepositoryImpl struct {
	db *gorm.DB
}

// NewDocumentMemoryRepository 创建文档记忆Repository实例
func NewDocumentMemoryRepository(db *gorm.DB) repository.DocumentMemoryRepository {
	return &DocumentMemoryRepositoryImpl{
		db: db,
	}
}

// GetUserMemoryDocument 根据用户ID和连接器ID获取记忆文档
func (r *DocumentMemoryRepositoryImpl) GetUserMemoryDocument(ctx context.Context, userID string, connectorID int64) (*entity.UserMemoryDocument, error) {
	logs.CtxInfof(ctx, "GetUserMemoryDocument: userID=%s, connectorID=%d", userID, connectorID)

	var document entity.UserMemoryDocument
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND connector_id = ?", userID, connectorID).
		First(&document).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxInfof(ctx, "User memory document not found for user_id=%s, connector_id=%d", userID, connectorID)
			return nil, nil
		}
		logs.CtxErrorf(ctx, "Failed to get user memory document: %v", err)
		return nil, err
	}

	logs.CtxInfof(ctx, "Found user memory document: id=%d, line_count=%d", document.ID, document.LineCount)
	return &document, nil
}

// CreateOrUpdateUserMemoryDocument 创建或更新用户记忆文档
func (r *DocumentMemoryRepositoryImpl) CreateOrUpdateUserMemoryDocument(ctx context.Context, document *entity.UserMemoryDocument) error {
	logs.CtxInfof(ctx, "CreateOrUpdateUserMemoryDocument: userID=%s, connectorID=%d", document.UserID, document.ConnectorID)

	// 使用ON DUPLICATE KEY UPDATE语法处理插入或更新
	result := r.db.WithContext(ctx).
		Where("user_id = ? AND connector_id = ?", document.UserID, document.ConnectorID).
		Assign(map[string]interface{}{
			"document_content": document.DocumentContent,
			"line_count":       document.LineCount,
			"version":          gorm.Expr("version + 1"), // 版本号自增
			"enabled":          document.Enabled,
		}).
		FirstOrCreate(document)

	if result.Error != nil {
		logs.CtxErrorf(ctx, "Failed to create or update user memory document: %v", result.Error)
		return result.Error
	}

	logs.CtxInfof(ctx, "Successfully created/updated user memory document: id=%d", document.ID)
	return nil
}

// GetUserMemoryConfig 获取用户记忆配置
func (r *DocumentMemoryRepositoryImpl) GetUserMemoryConfig(ctx context.Context, userID string, connectorID int64) (*entity.UserMemoryConfig, error) {
	logs.CtxInfof(ctx, "GetUserMemoryConfig: userID=%s, connectorID=%d", userID, connectorID)

	var config entity.UserMemoryConfig
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND connector_id = ?", userID, connectorID).
		First(&config).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxInfof(ctx, "User memory config not found for user_id=%s, connector_id=%d", userID, connectorID)
			return nil, nil
		}
		logs.CtxErrorf(ctx, "Failed to get user memory config: %v", err)
		return nil, err
	}

	logs.CtxInfof(ctx, "Found user memory config: id=%d, memory_enabled=%v", config.ID, config.MemoryEnabled)
	return &config, nil
}

// CreateOrUpdateUserMemoryConfig 创建或更新用户记忆配置
func (r *DocumentMemoryRepositoryImpl) CreateOrUpdateUserMemoryConfig(ctx context.Context, config *entity.UserMemoryConfig) error {
	logs.CtxInfof(ctx, "CreateOrUpdateUserMemoryConfig: userID=%s, connectorID=%d, enabled=%v", 
		config.UserID, config.ConnectorID, config.MemoryEnabled)

	result := r.db.WithContext(ctx).
		Where("user_id = ? AND connector_id = ?", config.UserID, config.ConnectorID).
		Assign(map[string]interface{}{
			"memory_enabled":         config.MemoryEnabled,
			"auto_learn":            config.AutoLearn,
			"search_context_lines":  config.SearchContextLines,
			"max_document_lines":    config.MaxDocumentLines,
		}).
		FirstOrCreate(config)

	if result.Error != nil {
		logs.CtxErrorf(ctx, "Failed to create or update user memory config: %v", result.Error)
		return result.Error
	}

	logs.CtxInfof(ctx, "Successfully created/updated user memory config: id=%d", config.ID)
	return nil
}

// DeleteUserMemoryDocument 删除用户记忆文档
func (r *DocumentMemoryRepositoryImpl) DeleteUserMemoryDocument(ctx context.Context, userID string, connectorID int64) error {
	logs.CtxInfof(ctx, "DeleteUserMemoryDocument: userID=%s, connectorID=%d", userID, connectorID)

	result := r.db.WithContext(ctx).
		Where("user_id = ? AND connector_id = ?", userID, connectorID).
		Delete(&entity.UserMemoryDocument{})

	if result.Error != nil {
		logs.CtxErrorf(ctx, "Failed to delete user memory document: %v", result.Error)
		return result.Error
	}

	logs.CtxInfof(ctx, "Successfully deleted user memory document, affected rows: %d", result.RowsAffected)
	return nil
}