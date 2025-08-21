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

// ModelTemplate 模型模板实体
type ModelTemplate struct {
	ID        uint64  `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Provider  string  `gorm:"column:provider;size:64" json:"provider"`
	ModelName string  `gorm:"column:model_name;size:128" json:"model_name"`
	ModelType string  `gorm:"column:model_type;size:32" json:"model_type"`
	Template  string  `gorm:"column:template;type:json" json:"template"`
	CreatedAt uint64  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt uint64  `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt *uint64 `gorm:"column:deleted_at" json:"deleted_at"`
}

// TableName 指定表名
func (ModelTemplate) TableName() string {
	return "model_template"
}