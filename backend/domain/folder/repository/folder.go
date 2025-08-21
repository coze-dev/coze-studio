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

	"github.com/coze-dev/coze-studio/backend/domain/folder/entity"
)

// FolderRepository 文件夹仓储接口
type FolderRepository interface {
	// CreateFolder 创建文件夹
	CreateFolder(ctx context.Context, folder *entity.Folder) (*entity.Folder, error)
	
	// GetFoldersBySpaceID 根据空间ID获取文件夹列表
	GetFoldersBySpaceID(ctx context.Context, spaceID int64, parentID *int64) ([]*entity.Folder, error)
	
	// GetFolderByID 根据ID获取文件夹
	GetFolderByID(ctx context.Context, folderID int64) (*entity.Folder, error)
	
	// DeleteFolder 删除文件夹
	DeleteFolder(ctx context.Context, folderID int64) error
	
	// MoveResourcesToFolder 移动资源到文件夹
	MoveResourcesToFolder(ctx context.Context, spaceID int64, folderID int64, resourceIDs []int64, resourceType int32) error
	
	// GetResourceFolderMappings 获取资源文件夹映射
	GetResourceFolderMappings(ctx context.Context, spaceID int64, resourceIDs []int64, resourceType int32) ([]*entity.ResourceFolderMapping, error)
	
	// RemoveResourcesFromFolder 从文件夹移除资源
	RemoveResourcesFromFolder(ctx context.Context, spaceID int64, resourceIDs []int64, resourceType int32) error
}