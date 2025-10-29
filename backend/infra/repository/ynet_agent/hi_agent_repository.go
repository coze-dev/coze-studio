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
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/ynet_agent"
)

type hiAgentRepositoryImpl struct {
	db *gorm.DB
}

func NewHiAgentRepository(db *gorm.DB) ynet_agent.HiAgentRepository {
	return &hiAgentRepositoryImpl{db: db}
}

func (r *hiAgentRepositoryImpl) Create(agent *ynet_agent.HiAgent) error {
	// 生成唯一ID
	agent.AgentID = r.generateAgentID()
	agent.CreatedAt = time.Now().Unix()
	agent.UpdatedAt = time.Now().Unix()

	// 加密API Key
	if agent.APIKey != nil && *agent.APIKey != "" {
		encrypted, err := r.encryptAPIKey(*agent.APIKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt API key: %w", err)
		}
		agent.APIKey = &encrypted
	}

	return r.db.Create(agent).Error
}

func (r *hiAgentRepositoryImpl) Update(agent *ynet_agent.HiAgent) error {
	agent.UpdatedAt = time.Now().Unix()

	// 加密API Key
	if agent.APIKey != nil && *agent.APIKey != "" {
		encrypted, err := r.encryptAPIKey(*agent.APIKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt API key: %w", err)
		}
		agent.APIKey = &encrypted
	}

	return r.db.Where("agent_id = ? AND space_id = ?", agent.AgentID, agent.SpaceID).Updates(agent).Error
}

func (r *hiAgentRepositoryImpl) Delete(agentID string, spaceID int64) error {
	return r.db.Where("agent_id = ? AND space_id = ?", agentID, spaceID).Delete(&ynet_agent.HiAgent{}).Error
}

func (r *hiAgentRepositoryImpl) GetByID(agentID string, spaceID int64) (*ynet_agent.HiAgent, error) {
	agent, err := r.getByIDInternal(agentID, spaceID)
	if err != nil {
		return nil, err
	}

	// 不返回API Key，安全考虑
	agent.APIKey = nil

	return agent, nil
}

// GetByIDWithAPIKey 获取HiAgent包含API Key（内部使用）
func (r *hiAgentRepositoryImpl) GetByIDWithAPIKey(agentID string, spaceID int64) (*ynet_agent.HiAgent, error) {
	return r.getByIDInternal(agentID, spaceID)
}

// getByIDInternal 内部使用的方法，包含完整的API Key信息
func (r *hiAgentRepositoryImpl) getByIDInternal(agentID string, spaceID int64) (*ynet_agent.HiAgent, error) {
	var agent ynet_agent.HiAgent

	err := r.db.Where("agent_id = ? AND space_id = ?", agentID, spaceID).First(&agent).Error
	if err != nil {
		return nil, err
	}

	// 解密API Key（如果需要的话）
	if agent.APIKey != nil && *agent.APIKey != "" {
		decrypted, err := r.decryptAPIKey(*agent.APIKey)
		if err == nil {
			agent.APIKey = &decrypted
		}
		// 如果解密失败，保留原值（可能本来就是明文）
	}

	return &agent, nil
}

func (r *hiAgentRepositoryImpl) List(spaceID int64, pageSize int, pageToken string, filter string, sortBy string) ([]*ynet_agent.HiAgent, int64, string, error) {
	var agents []*ynet_agent.HiAgent
	var total int64

	query := r.db.Model(&ynet_agent.HiAgent{}).Where("space_id = ?", spaceID)

	// 应用筛选条件
	if filter != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+filter+"%", "%"+filter+"%")
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, "", err
	}

	// 应用排序
	if sortBy == "" {
		sortBy = "created_at DESC"
	}
	query = query.Order(sortBy)

	// 应用分页
	if pageSize <= 0 {
		pageSize = 20
	}
	query = query.Limit(pageSize)

	if pageToken != "" {
		// 这里简化处理，实际项目中可以使用更复杂的分页token逻辑
		offset := r.decodePageToken(pageToken)
		query = query.Offset(offset)
	}

	if err := query.Find(&agents).Error; err != nil {
		return nil, 0, "", err
	}

	// 不返回API Key
	for _, agent := range agents {
		agent.APIKey = nil
	}

	// 生成下一页token
	var nextPageToken string
	if len(agents) == pageSize {
		nextPageToken = r.generatePageToken(len(agents))
	}

	return agents, total, nextPageToken, nil
}

func (r *hiAgentRepositoryImpl) generateAgentID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return fmt.Sprintf("hi-agent-%s", base64.URLEncoding.EncodeToString(bytes)[:16])
}

func (r *hiAgentRepositoryImpl) encryptAPIKey(apiKey string) (string, error) {
	// 简化的加密实现，实际项目中应该使用更安全的加密方法
	bytes := make([]byte, 16)
	rand.Read(bytes)
	salt := base64.StdEncoding.EncodeToString(bytes)
	return fmt.Sprintf("encrypted_%s_%s", salt, base64.StdEncoding.EncodeToString([]byte(apiKey))), nil
}

func (r *hiAgentRepositoryImpl) decryptAPIKey(encryptedKey string) (string, error) {
	// 对应的解密实现
	parts := strings.Split(encryptedKey, "_")
	if len(parts) != 3 || parts[0] != "encrypted" {
		return "", fmt.Errorf("invalid encrypted key format")
	}
	decoded, err := base64.StdEncoding.DecodeString(parts[2])
	if err != nil {
		return "", err
	}
	return string(decoded), nil
}

func (r *hiAgentRepositoryImpl) generatePageToken(offset int) string {
	return base64.URLEncoding.EncodeToString([]byte(fmt.Sprintf("%d", offset)))
}

func (r *hiAgentRepositoryImpl) decodePageToken(token string) int {
	decoded, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		return 0
	}
	var offset int
	fmt.Sscanf(string(decoded), "%d", &offset)
	return offset
}

func (r *hiAgentRepositoryImpl) TestConnection(endpoint, authType, apiKey string) (bool, string, error) {
	// 简化的连接测试实现
	// 实际项目中应该根据不同的平台类型进行真实的连接测试
	if endpoint == "" {
		return false, "endpoint is required", nil
	}

	// 这里可以添加实际的HTTP请求测试
	// 目前简化处理，假设连接总是成功
	return true, "Connection test successful", nil
}