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

package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/documentmemory/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// DocumentMemoryServiceImpl 文档记忆服务实现
type DocumentMemoryServiceImpl struct {
	repo repository.DocumentMemoryRepository
}

// NewDocumentMemoryService 创建文档记忆服务实例
func NewDocumentMemoryService(repo repository.DocumentMemoryRepository) entity.DocumentMemoryService {
	return &DocumentMemoryServiceImpl{
		repo: repo,
	}
}

// AddMemory 添加记忆到文档
func (s *DocumentMemoryServiceImpl) AddMemory(ctx context.Context, req *entity.AddMemoryRequest) error {
	logs.CtxInfof(ctx, "🧠 AddMemory: userID=%s, connectorID=%d, content=%s", 
		req.UserID, req.ConnectorID, truncateString(req.Content, 100))

	// 1. 检查记忆功能是否启用
	enabled, err := s.IsMemoryEnabled(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to check if memory is enabled: %v", err)
		return err
	}

	if !enabled {
		logs.CtxInfof(ctx, "Memory is disabled for user_id=%s, connector_id=%d", req.UserID, req.ConnectorID)
		return nil // 不报错，只是不执行
	}

	// 2. 获取现有的记忆文档
	doc, err := s.repo.GetUserMemoryDocument(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get user memory document: %v", err)
		return err
	}

	// 3. 准备新的内容
	newContent := strings.TrimSpace(req.Content)
	if newContent == "" {
		return fmt.Errorf("记忆内容不能为空")
	}

	// 4. 构建更新后的文档内容
	var updatedContent string
	var lineCount int

	if doc == nil {
		// 创建新文档
		updatedContent = newContent
		lineCount = len(entity.SplitIntoLines(newContent))
		
		doc = &entity.UserMemoryDocument{
			UserID:          req.UserID,
			ConnectorID:     req.ConnectorID,
			DocumentContent: updatedContent,
			LineCount:       lineCount,
			Version:         1,
			Enabled:         true,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
	} else {
		// 更新现有文档
		if doc.DocumentContent == "" {
			updatedContent = newContent
		} else {
			updatedContent = doc.DocumentContent + "\n" + newContent
		}
		
		lineCount = len(entity.SplitIntoLines(updatedContent))
		doc.DocumentContent = updatedContent
		doc.LineCount = lineCount
		doc.UpdatedAt = time.Now()
	}

	// 5. 检查文档大小限制
	config, err := s.repo.GetUserMemoryConfig(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get user memory config: %v", err)
		return err
	}

	maxLines := 10000 // 默认值
	if config != nil && config.MaxDocumentLines > 0 {
		maxLines = config.MaxDocumentLines
	}

	if lineCount > maxLines {
		logs.CtxWarnf(ctx, "Document exceeds max lines limit: %d > %d, truncating old content", lineCount, maxLines)
		
		lines := entity.SplitIntoLines(updatedContent)
		// 保留最新的内容，丢弃最旧的
		if len(lines) > maxLines {
			keepLines := lines[len(lines)-maxLines:]
			doc.DocumentContent = strings.Join(keepLines, "\n")
			doc.LineCount = len(keepLines)
		}
	}

	// 6. 保存文档
	err = s.repo.CreateOrUpdateUserMemoryDocument(ctx, doc)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to save user memory document: %v", err)
		return err
	}

	logs.CtxInfof(ctx, "🧠 Successfully added memory: document_id=%d, line_count=%d", doc.ID, doc.LineCount)
	return nil
}

// SearchMemory 搜索记忆并返回上下文
func (s *DocumentMemoryServiceImpl) SearchMemory(ctx context.Context, req *entity.SearchMemoryRequest) ([]*entity.MemorySearchResult, error) {
	logs.CtxInfof(ctx, "🧠 SearchMemory: userID=%s, connectorID=%d, query=%s", 
		req.UserID, req.ConnectorID, req.Query)

	if strings.TrimSpace(req.Query) == "" {
		return []*entity.MemorySearchResult{}, nil
	}

	// 1. 检查记忆功能是否启用
	enabled, err := s.IsMemoryEnabled(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to check if memory is enabled: %v", err)
		return nil, err
	}

	if !enabled {
		logs.CtxInfof(ctx, "Memory is disabled for user_id=%s, connector_id=%d", req.UserID, req.ConnectorID)
		return []*entity.MemorySearchResult{}, nil
	}

	// 2. 获取记忆文档
	doc, err := s.repo.GetUserMemoryDocument(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get user memory document: %v", err)
		return nil, err
	}

	if doc == nil || doc.DocumentContent == "" {
		logs.CtxInfof(ctx, "No memory document found for user_id=%s, connector_id=%d", req.UserID, req.ConnectorID)
		return []*entity.MemorySearchResult{}, nil
	}

	// 3. 获取上下文行数配置
	config, err := s.repo.GetUserMemoryConfig(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get user memory config: %v", err)
		return nil, err
	}

	contextLines := 10 // 默认值
	if config != nil && config.SearchContextLines > 0 {
		contextLines = config.SearchContextLines
	}

	// 4. 执行语义搜索
	results, err := s.performSemanticSearch(ctx, doc.DocumentContent, req.Query, contextLines)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to perform semantic search: %v", err)
		return nil, err
	}

	logs.CtxInfof(ctx, "🧠 SearchMemory completed: found %d results", len(results))
	return results, nil
}

// GetMemoryDocument 获取用户的完整记忆文档
func (s *DocumentMemoryServiceImpl) GetMemoryDocument(ctx context.Context, req *entity.GetMemoryRequest) (*entity.UserMemoryDocument, error) {
	logs.CtxInfof(ctx, "🧠 GetMemoryDocument: userID=%s, connectorID=%d", req.UserID, req.ConnectorID)

	doc, err := s.repo.GetUserMemoryDocument(ctx, req.UserID, req.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get user memory document: %v", err)
		return nil, err
	}

	return doc, nil
}

// IsMemoryEnabled 检查用户是否开启了记忆功能
func (s *DocumentMemoryServiceImpl) IsMemoryEnabled(ctx context.Context, userID string, connectorID int64) (bool, error) {
	config, err := s.repo.GetUserMemoryConfig(ctx, userID, connectorID)
	if err != nil {
		return false, err
	}

	if config == nil {
		// 没有配置记录，默认为关闭
		return false, nil
	}

	return config.MemoryEnabled, nil
}

// EnableMemory 启用记忆功能
func (s *DocumentMemoryServiceImpl) EnableMemory(ctx context.Context, userID string, connectorID int64) error {
	logs.CtxInfof(ctx, "🧠 EnableMemory: userID=%s, connectorID=%d", userID, connectorID)

	config := &entity.UserMemoryConfig{
		UserID:               userID,
		ConnectorID:          connectorID,
		MemoryEnabled:        true,
		AutoLearn:           true,
		SearchContextLines:  10,
		MaxDocumentLines:    10000,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	return s.repo.CreateOrUpdateUserMemoryConfig(ctx, config)
}

// DisableMemory 禁用记忆功能
func (s *DocumentMemoryServiceImpl) DisableMemory(ctx context.Context, userID string, connectorID int64) error {
	logs.CtxInfof(ctx, "🧠 DisableMemory: userID=%s, connectorID=%d", userID, connectorID)

	config := &entity.UserMemoryConfig{
		UserID:      userID,
		ConnectorID: connectorID,
		MemoryEnabled: false,
		UpdatedAt:   time.Now(),
	}

	return s.repo.CreateOrUpdateUserMemoryConfig(ctx, config)
}

// performSemanticSearch 执行语义搜索（简单的关键词匹配实现）
func (s *DocumentMemoryServiceImpl) performSemanticSearch(ctx context.Context, documentContent, query string, contextLines int) ([]*entity.MemorySearchResult, error) {
	// 将文档按行分割
	lines := entity.SplitIntoLines(documentContent)
	if len(lines) == 0 {
		return []*entity.MemorySearchResult{}, nil
	}

	// 将查询转换为小写进行搜索
	queryLower := strings.ToLower(query)
	var results []*entity.MemorySearchResult

	// 搜索匹配的行
	for i, line := range lines {
		lineLower := strings.ToLower(line)
		if strings.Contains(lineLower, queryLower) {
			// 获取上下文行
			contextResult, startLine, endLine := entity.GetContextLines(lines, i, contextLines)
			
			result := &entity.MemorySearchResult{
				Content:     strings.Join(contextResult, "\n"),
				LineNumber:  i + 1, // 从1开始计数
				ContextInfo: fmt.Sprintf("匹配行 %d，上下文 %d-%d", i+1, startLine+1, endLine+1),
				Lines:       contextResult,
			}
			
			results = append(results, result)
		}
	}

	logs.CtxInfof(ctx, "🧠 Semantic search found %d matches for query: %s", len(results), query)
	return results, nil
}

// truncateString 截断字符串用于日志显示
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}