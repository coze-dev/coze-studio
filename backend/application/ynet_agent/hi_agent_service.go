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
	"fmt"
	"net/http"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/ynet_agent"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

type hiAgentServiceImpl struct {
	repo ynet_agent.HiAgentRepository
}

var globalService ynet_agent.HiAgentService

// InitService 初始化 HiAgent 服务
func InitService(db *gorm.DB, idgenSvc idgen.IDGenerator, repo ynet_agent.HiAgentRepository) ynet_agent.HiAgentService {
	globalService = NewHiAgentService(repo)
	return globalService
}

// GetService 获取全局服务实例
func GetService() ynet_agent.HiAgentService {
	return globalService
}

func NewHiAgentService(repo ynet_agent.HiAgentRepository) ynet_agent.HiAgentService {
	return &hiAgentServiceImpl{repo: repo}
}

func (s *hiAgentServiceImpl) CreateHiAgent(spaceID int64, name, description, iconURL, endpoint, authType, apiKey string, meta ynet_agent.MetaData) (*ynet_agent.HiAgent, error) {
	// 验证必填字段
	if name == "" {
		return nil, fmt.Errorf("name is required")
	}
	if endpoint == "" {
		return nil, fmt.Errorf("endpoint is required")
	}
	if authType == "" {
		return nil, fmt.Errorf("auth_type is required")
	}

	// 验证认证类型
	if authType != "bearer" && authType != "api_key" {
		return nil, fmt.Errorf("invalid auth_type, must be 'bearer' or 'api_key'")
	}

	agent := &ynet_agent.HiAgent{
		SpaceID:  spaceID,
		Name:     name,
		Endpoint: endpoint,
		AuthType: authType,
		Status:   1, // 默认启用
		Meta:     meta,
	}

	if description != "" {
		agent.Description = &description
	}
	if iconURL != "" {
		agent.IconURL = &iconURL
	}
	if apiKey != "" {
		agent.APIKey = &apiKey
	}

	err := s.repo.Create(agent)
	if err != nil {
		return nil, fmt.Errorf("failed to create hi agent: %w", err)
	}

	// 重新获取创建的实体（不包含API Key）
	return s.repo.GetByID(agent.AgentID, spaceID)
}

func (s *hiAgentServiceImpl) UpdateHiAgent(agentID string, spaceID int64, name, description, iconURL, endpoint, authType, apiKey *string, status *int32, meta ynet_agent.MetaData) (*ynet_agent.HiAgent, error) {
	// 先获取现有记录
	existing, err := s.repo.GetByID(agentID, spaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing hi agent: %w", err)
	}

	// 更新字段
	if name != nil {
		existing.Name = *name
	}
	if description != nil {
		existing.Description = description
	}
	if iconURL != nil {
		existing.IconURL = iconURL
	}
	if endpoint != nil {
		existing.Endpoint = *endpoint
	}
	if authType != nil {
		if *authType != "bearer" && *authType != "api_key" {
			return nil, fmt.Errorf("invalid auth_type, must be 'bearer' or 'api_key'")
		}
		existing.AuthType = *authType
	}
	if apiKey != nil {
		existing.APIKey = apiKey
	}
	if status != nil {
		existing.Status = *status
	}
	if meta != nil {
		existing.Meta = meta
	}

	err = s.repo.Update(existing)
	if err != nil {
		return nil, fmt.Errorf("failed to update hi agent: %w", err)
	}

	// 重新获取更新后的实体（不包含API Key）
	return s.repo.GetByID(agentID, spaceID)
}

func (s *hiAgentServiceImpl) DeleteHiAgent(agentID string, spaceID int64) error {
	// 先检查是否存在
	_, err := s.repo.GetByID(agentID, spaceID)
	if err != nil {
		return fmt.Errorf("hi agent not found: %w", err)
	}

	err = s.repo.Delete(agentID, spaceID)
	if err != nil {
		return fmt.Errorf("failed to delete hi agent: %w", err)
	}

	return nil
}

func (s *hiAgentServiceImpl) GetHiAgent(agentID string, spaceID int64) (*ynet_agent.HiAgent, error) {
	agent, err := s.repo.GetByID(agentID, spaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get hi agent: %w", err)
	}
	return agent, nil
}

func (s *hiAgentServiceImpl) ListHiAgents(spaceID int64, pageSize int, pageToken string, filter string, sortBy string) ([]*ynet_agent.HiAgent, int64, string, error) {
	agents, total, nextPageToken, err := s.repo.List(spaceID, pageSize, pageToken, filter, sortBy)
	if err != nil {
		return nil, 0, "", fmt.Errorf("failed to list hi agents: %w", err)
	}
	return agents, total, nextPageToken, nil
}

func (s *hiAgentServiceImpl) TestConnection(endpoint, authType, apiKey string) (bool, string, error) {
	// 创建HTTP客户端
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// 创建请求
	req, err := http.NewRequest("GET", endpoint+"/health", nil)
	if err != nil {
		return false, "Invalid endpoint URL", nil
	}

	// 添加认证头
	switch authType {
	case "bearer":
		if apiKey != "" {
			req.Header.Set("Authorization", "Bearer "+apiKey)
		}
	case "api_key":
		if apiKey != "" {
			req.Header.Set("X-API-Key", apiKey)
		}
	}

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err), nil
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return true, "Connection successful", nil
	}

	return false, fmt.Sprintf("Connection failed with status: %d", resp.StatusCode), nil
}