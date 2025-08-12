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

type ModelEntity struct {
	ID            uint64  `gorm:"primaryKey;comment:主键ID" json:"id"`
	MetaID        uint64  `gorm:"not null;comment:模型元信息 id" json:"meta_id"`
	Name          string  `gorm:"size:128;not null;comment:名称" json:"name"`
	Description   *string `gorm:"type:text;comment:描述" json:"description"`
	DefaultParams string  `gorm:"type:json;not null;comment:默认参数" json:"default_params"`
	Scenario      uint64  `gorm:"not null;comment:模型应用场景" json:"scenario"`
	Status        int     `gorm:"not null;default:1;comment:模型状态" json:"status"`
	CreatedAt     uint64  `gorm:"not null;default:0;comment:Create Time in Milliseconds" json:"created_at"`
	UpdatedAt     uint64  `gorm:"not null;default:0;comment:Update Time in Milliseconds" json:"updated_at"`
	DeletedAt     *uint64 `gorm:"comment:Delete Time in Milliseconds" json:"deleted_at"`
}

func (ModelEntity) TableName() string {
	return "model_entity"
}

type ModelMeta struct {
	ID          uint64  `gorm:"primaryKey;comment:主键ID" json:"id"`
	ModelName   string  `gorm:"size:128;not null;comment:模型名称" json:"model_name"`
	Protocol    string  `gorm:"size:128;not null;comment:模型协议" json:"protocol"`
	IconURI     string  `gorm:"size:255;not null;default:'';comment:Icon URI" json:"icon_uri"`
	IconURL     string  `gorm:"size:255;not null;default:'';comment:Icon URL" json:"icon_url"`
	Capability  *string `gorm:"type:json;comment:模型能力" json:"capability"`
	ConnConfig  *string `gorm:"type:json;comment:模型连接配置" json:"conn_config"`
	Status      int     `gorm:"not null;default:1;comment:模型状态" json:"status"`
	Description string  `gorm:"size:2048;not null;default:'';comment:模型描述" json:"description"`
	CreatedAt   uint64  `gorm:"not null;default:0;comment:Create Time in Milliseconds" json:"created_at"`
	UpdatedAt   uint64  `gorm:"not null;default:0;comment:Update Time in Milliseconds" json:"updated_at"`
	DeletedAt   *uint64 `gorm:"comment:Delete Time in Milliseconds" json:"deleted_at"`
}

func (ModelMeta) TableName() string {
	return "model_meta"
}
