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
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/folder/entity"
	"github.com/coze-dev/coze-studio/backend/domain/folder/repository"
)

type folderRepository struct {
	db *gorm.DB
}

// NewFolderRepository creates a new folder repository
func NewFolderRepository(db *gorm.DB) repository.FolderRepository {
	return &folderRepository{db: db}
}

// CreateFolder 创建文件夹
func (r *folderRepository) CreateFolder(ctx context.Context, folder *entity.Folder) (*entity.Folder, error) {
	now := time.Now().UnixMilli()
	folder.CreatedAt = now
	folder.UpdatedAt = now

	if err := r.db.WithContext(ctx).Create(folder).Error; err != nil {
		return nil, err
	}

	return folder, nil
}

// GetFoldersBySpaceID 根据空间ID获取文件夹列表
func (r *folderRepository) GetFoldersBySpaceID(ctx context.Context, spaceID int64, parentID *int64) ([]*entity.Folder, error) {
	var folders []*entity.Folder
	
	query := r.db.WithContext(ctx).Where("space_id = ? AND deleted_at IS NULL", spaceID)
	
	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}
	
	if err := query.Order("created_at DESC").Find(&folders).Error; err != nil {
		return nil, err
	}

	return folders, nil
}

// GetFolderByID 根据ID获取文件夹
func (r *folderRepository) GetFolderByID(ctx context.Context, folderID int64) (*entity.Folder, error) {
	var folder entity.Folder
	if err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", folderID).First(&folder).Error; err != nil {
		return nil, err
	}
	return &folder, nil
}

// DeleteFolder 删除文件夹
func (r *folderRepository) DeleteFolder(ctx context.Context, folderID int64) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&entity.Folder{}).
		Where("id = ?", folderID).
		Update("deleted_at", now).Error
}

// MoveResourcesToFolder 移动资源到文件夹
func (r *folderRepository) MoveResourcesToFolder(ctx context.Context, spaceID int64, folderID int64, resourceIDs []int64, resourceType int32) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 先删除已有的映射
		if err := tx.Where("space_id = ? AND resource_type = ? AND resource_id IN ?", spaceID, resourceType, resourceIDs).
			Delete(&entity.ResourceFolderMapping{}).Error; err != nil {
			return err
		}

		// 创建新的映射
		now := time.Now().UnixMilli()
		mappings := make([]*entity.ResourceFolderMapping, 0, len(resourceIDs))
		for _, resourceID := range resourceIDs {
			mappings = append(mappings, &entity.ResourceFolderMapping{
				SpaceID:      spaceID,
				ResourceID:   resourceID,
				ResourceType: resourceType,
				FolderID:     folderID,
				CreatedAt:    now,
				UpdatedAt:    now,
			})
		}

		if len(mappings) > 0 {
			if err := tx.Create(&mappings).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetResourceFolderMappings 获取资源文件夹映射
func (r *folderRepository) GetResourceFolderMappings(ctx context.Context, spaceID int64, resourceIDs []int64, resourceType int32) ([]*entity.ResourceFolderMapping, error) {
	var mappings []*entity.ResourceFolderMapping
	if err := r.db.WithContext(ctx).Where("space_id = ? AND resource_type = ? AND resource_id IN ?", spaceID, resourceType, resourceIDs).
		Find(&mappings).Error; err != nil {
		return nil, err
	}
	return mappings, nil
}

// RemoveResourcesFromFolder 从文件夹移除资源
func (r *folderRepository) RemoveResourcesFromFolder(ctx context.Context, spaceID int64, resourceIDs []int64, resourceType int32) error {
	return r.db.WithContext(ctx).Where("space_id = ? AND resource_type = ? AND resource_id IN ?", spaceID, resourceType, resourceIDs).
		Delete(&entity.ResourceFolderMapping{}).Error
}