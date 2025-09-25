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

package ynet_agent

import (
	"gorm.io/gorm"
)

// HiAgent 外部智能体实体
type HiAgent struct {
	AgentID     string            `gorm:"column:agent_id;primaryKey" json:"agent_id"`
	SpaceID     int64             `gorm:"column:space_id;not null;index" json:"space_id"`
	Name        string            `gorm:"column:name;not null" json:"name"`
	Description *string           `gorm:"column:description" json:"description"`
	IconURL     *string           `gorm:"column:icon_url" json:"icon_url"`
	Endpoint    string            `gorm:"column:endpoint;not null" json:"endpoint"`
	AuthType    string            `gorm:"column:auth_type;not null" json:"auth_type"` // bearer, api_key
	APIKey      *string           `gorm:"column:api_key" json:"api_key"`              // 加密存储
	Status      int32             `gorm:"column:status;default:1" json:"status"`     // 0-禁用，1-启用
	Meta        map[string]string `gorm:"column:meta;type:json" json:"meta"`
	CreatedAt   int64             `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt   int64             `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt    `gorm:"column:deleted_at;index" json:"-"`
}

func (HiAgent) TableName() string {
	return "hi_agent"
}

// HiAgentRepository 仓储接口
type HiAgentRepository interface {
	Create(agent *HiAgent) error
	Update(agent *HiAgent) error
	Delete(agentID string, spaceID int64) error
	GetByID(agentID string, spaceID int64) (*HiAgent, error)
	List(spaceID int64, pageSize int, pageToken string, filter string, sortBy string) ([]*HiAgent, int64, string, error)
}

// HiAgentService 服务接口
type HiAgentService interface {
	CreateHiAgent(spaceID int64, name, description, iconURL, endpoint, authType, apiKey string, meta map[string]string) (*HiAgent, error)
	UpdateHiAgent(agentID string, spaceID int64, name, description, iconURL, endpoint, authType, apiKey *string, status *int32, meta map[string]string) (*HiAgent, error)
	DeleteHiAgent(agentID string, spaceID int64) error
	GetHiAgent(agentID string, spaceID int64) (*HiAgent, error)
	ListHiAgents(spaceID int64, pageSize int, pageToken string, filter string, sortBy string) ([]*HiAgent, int64, string, error)
	TestConnection(endpoint, authType, apiKey string) (bool, string, error)
}