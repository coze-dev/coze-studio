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

type SpaceModel struct {
	ID            uint64  `gorm:"primaryKey;autoIncrement;comment:主键ID" json:"id"`
	SpaceID       uint64  `gorm:"not null;comment:空间ID" json:"space_id"`
	ModelEntityID uint64  `gorm:"not null;comment:模型实体ID" json:"model_entity_id"`
	UserID        uint64  `gorm:"not null;comment:创建者ID" json:"user_id"`
	Status        int     `gorm:"not null;default:1;comment:状态: 1启用 2禁用" json:"status"`
	CustomConfig  *string `gorm:"type:json;comment:空间自定义配置(覆盖默认配置)" json:"custom_config"`
	CreatedAt     uint64  `gorm:"not null;default:0;comment:创建时间" json:"created_at"`
	UpdatedAt     uint64  `gorm:"not null;default:0;comment:更新时间" json:"updated_at"`
	DeletedAt     *uint64 `gorm:"comment:删除时间" json:"deleted_at"`
}

func (SpaceModel) TableName() string {
	return "space_model"
}

type SpaceModelView struct {
	ID            string                 `json:"id"`
	Name          string                 `json:"name"`
	Description   string                 `json:"description"`
	ContextLength int64                  `json:"context_length"`
	IconURI       string                 `json:"icon_uri"`
	IconURL       string                 `json:"icon_url,omitempty"`
	Protocol      string                 `json:"protocol"`
	Status        int                    `json:"status"`
	CustomConfig  map[string]interface{} `json:"custom_config,omitempty"`
}
