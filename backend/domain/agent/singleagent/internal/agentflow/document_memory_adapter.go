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

package agentflow

import (
	"context"
	"strings"

	documentEntity "github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/entity"
)

// DocumentMemoryAdapter 文档记忆服务适配器，实现DocumentMemoryService接口
type DocumentMemoryAdapter struct {
	service documentEntity.DocumentMemoryService
}

// NewDocumentMemoryAdapter 创建文档记忆服务适配器
func NewDocumentMemoryAdapter(service documentEntity.DocumentMemoryService) DocumentMemoryService {
	return &DocumentMemoryAdapter{
		service: service,
	}
}

// AddMemory 添加记忆
func (a *DocumentMemoryAdapter) AddMemory(ctx context.Context, userID string, connectorID int64, content string) error {
	if a.service == nil {
		return nil // 服务不可用时不报错，静默跳过
	}

	req := &documentEntity.AddMemoryRequest{
		UserID:      userID,
		ConnectorID: connectorID,
		Content:     content,
	}

	return a.service.AddMemory(ctx, req)
}

// SearchMemory 搜索记忆
func (a *DocumentMemoryAdapter) SearchMemory(ctx context.Context, userID string, connectorID int64, query string) ([]string, error) {
	if a.service == nil {
		return []string{}, nil // 服务不可用时返回空结果
	}

	req := &documentEntity.SearchMemoryRequest{
		UserID:      userID,
		ConnectorID: connectorID,
		Query:       query,
	}

	results, err := a.service.SearchMemory(ctx, req)
	if err != nil {
		return nil, err
	}

	// 将结果转换为字符串数组
	stringResults := make([]string, len(results))
	for i, result := range results {
		var sb strings.Builder
		if result.ContextInfo != "" {
			sb.WriteString(result.ContextInfo + "\n")
		}
		sb.WriteString(result.Content)
		stringResults[i] = sb.String()
	}

	return stringResults, nil
}