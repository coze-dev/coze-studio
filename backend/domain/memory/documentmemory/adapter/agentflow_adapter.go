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

package adapter

import (
	"context"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// AgentflowAdapter 将DocumentMemoryService适配为agentflow接口
type AgentflowAdapter struct {
	documentMemoryService entity.DocumentMemoryService
}

// NewAgentflowAdapter 创建适配器实例
func NewAgentflowAdapter(documentMemoryService entity.DocumentMemoryService) *AgentflowAdapter {
	return &AgentflowAdapter{
		documentMemoryService: documentMemoryService,
	}
}

// AddMemory 适配AddMemory方法
func (a *AgentflowAdapter) AddMemory(ctx context.Context, userID string, connectorID int64, content string) error {
	logs.CtxInfof(ctx, "🔥 AgentflowAdapter.AddMemory: userID=%s, connectorID=%d, content=%s", 
		userID, connectorID, content)

	req := &entity.AddMemoryRequest{
		UserID:      userID,
		ConnectorID: connectorID,
		Content:     content,
	}

	return a.documentMemoryService.AddMemory(ctx, req)
}

// SearchMemory 适配SearchMemory方法
func (a *AgentflowAdapter) SearchMemory(ctx context.Context, userID string, connectorID int64, query string) ([]string, error) {
	logs.CtxInfof(ctx, "🔥 AgentflowAdapter.SearchMemory: userID=%s, connectorID=%d, query=%s", 
		userID, connectorID, query)

	req := &entity.SearchMemoryRequest{
		UserID:      userID,
		ConnectorID: connectorID,
		Query:       query,
	}

	results, err := a.documentMemoryService.SearchMemory(ctx, req)
	if err != nil {
		return nil, err
	}

	// 将搜索结果转换为字符串数组
	var contextLines []string
	for _, item := range results {
		// 将每个结果的内容添加到结果中
		contextLines = append(contextLines, strings.TrimSpace(item.Content))
	}

	logs.CtxInfof(ctx, "🔥 AgentflowAdapter.SearchMemory found %d results", len(contextLines))
	return contextLines, nil
}