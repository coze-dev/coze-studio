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

package external_knowledge

import (
	"time"
)

// ExternalKnowledgeBinding represents an external knowledge binding entity
type ExternalKnowledgeBinding struct {
	ID          int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      string     `gorm:"type:varchar(255);not null;uniqueIndex:uk_user_binding_key" json:"user_id"`
	BindingKey  string     `gorm:"type:varchar(500);not null;uniqueIndex:uk_user_binding_key" json:"binding_key"`
	BindingName *string    `gorm:"type:varchar(255)" json:"binding_name"`
	BindingType string     `gorm:"type:varchar(50);not null;default:'default'" json:"binding_type"`
	ExtraConfig *string    `gorm:"type:json" json:"extra_config"`
	Status      int8       `gorm:"type:tinyint(1);not null;default:1" json:"status"`
	LastSyncAt  *time.Time `gorm:"type:timestamp" json:"last_sync_at"`
	CreatedAt   time.Time  `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// TableName specifies the table name for ExternalKnowledgeBinding
func (ExternalKnowledgeBinding) TableName() string {
	return "external_knowledge_binding"
}

// BindingStatus constants
const (
	BindingStatusDisabled = 0
	BindingStatusEnabled  = 1
)

// BindingType constants
const (
	BindingTypeDefault = "default"
	// Reserved for future types
	// BindingTypeNotion = "notion"
	// BindingTypeObsidian = "obsidian"
)