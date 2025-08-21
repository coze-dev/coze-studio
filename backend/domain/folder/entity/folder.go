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

package entity

import "time"

// Folder 文件夹实体
type Folder struct {
	ID          int64      `gorm:"column:id;primaryKey"`
	SpaceID     int64      `gorm:"column:space_id;not null"`
	ParentID    *int64     `gorm:"column:parent_id"`
	Name        string     `gorm:"column:name;not null"`
	Description string     `gorm:"column:description;default:''"`
	CreatorID   int64      `gorm:"column:creator_id;not null"`
	CreatedAt   int64      `gorm:"column:created_at;not null"`
	UpdatedAt   int64      `gorm:"column:updated_at;not null"`
	DeletedAt   *time.Time `gorm:"column:deleted_at"`
}

func (Folder) TableName() string {
	return "folder"
}

// ResourceFolderMapping 资源到文件夹映射实体
type ResourceFolderMapping struct {
	ID           int64 `gorm:"column:id;primaryKey"`
	SpaceID      int64 `gorm:"column:space_id;not null"`
	ResourceID   int64 `gorm:"column:resource_id;not null"`
	ResourceType int32 `gorm:"column:resource_type;not null"` // 1=agent, 2=workflow, 3=knowledge, 4=database, 5=plugin
	FolderID     int64 `gorm:"column:folder_id;not null"`
	CreatedAt    int64 `gorm:"column:created_at;not null"`
	UpdatedAt    int64 `gorm:"column:updated_at;not null"`
}

func (ResourceFolderMapping) TableName() string {
	return "resource_folder_mapping"
}

// ResourceType constants
const (
	ResourceTypeAgent     int32 = 1
	ResourceTypeWorkflow  int32 = 2
	ResourceTypeKnowledge int32 = 3
	ResourceTypeDatabase  int32 = 4
	ResourceTypePlugin    int32 = 5
)