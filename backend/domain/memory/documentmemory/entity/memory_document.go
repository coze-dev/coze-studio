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

import (
	"context"
	"strings"
	"time"
)

// UserMemoryDocument 用户记忆文档实体
type UserMemoryDocument struct {
	ID              int64     `json:"id" gorm:"column:id;primaryKey"`
	UserID          string    `json:"user_id" gorm:"column:user_id;not null"`
	ConnectorID     int64     `json:"connector_id" gorm:"column:connector_id;default:0"`
	DocumentContent string    `json:"document_content" gorm:"column:document_content;type:longtext;not null"`
	LineCount       int       `json:"line_count" gorm:"column:line_count;default:0"`
	Version         int       `json:"version" gorm:"column:version;default:1"`
	Enabled         bool      `json:"enabled" gorm:"column:enabled;default:true"`
	CreatedAt       time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (UserMemoryDocument) TableName() string {
	return "user_memory_document"
}

// UserMemoryConfig 用户记忆配置实体
type UserMemoryConfig struct {
	ID                    int64     `json:"id" gorm:"column:id;primaryKey"`
	UserID                string    `json:"user_id" gorm:"column:user_id;not null"`
	ConnectorID           int64     `json:"connector_id" gorm:"column:connector_id;default:0"`
	MemoryEnabled         bool      `json:"memory_enabled" gorm:"column:memory_enabled;default:false"`
	AutoLearn             bool      `json:"auto_learn" gorm:"column:auto_learn;default:true"`
	SearchContextLines    int       `json:"search_context_lines" gorm:"column:search_context_lines;default:10"`
	MaxDocumentLines      int       `json:"max_document_lines" gorm:"column:max_document_lines;default:10000"`
	CreatedAt             time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt             time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (UserMemoryConfig) TableName() string {
	return "user_memory_config"
}

// MemorySearchResult 记忆搜索结果
type MemorySearchResult struct {
	Content     string   `json:"content"`      // 匹配的上下文内容
	LineNumber  int      `json:"line_number"`  // 匹配行号
	ContextInfo string   `json:"context_info"` // 上下文信息描述
	Lines       []string `json:"lines"`        // 具体的文本行
}

// AddMemoryRequest 添加记忆请求
type AddMemoryRequest struct {
	UserID      string `json:"user_id"`      // 用户ID
	ConnectorID int64  `json:"connector_id"` // 连接器ID，默认为0表示全局
	Content     string `json:"content"`      // 要添加的记忆内容
}

// SearchMemoryRequest 搜索记忆请求
type SearchMemoryRequest struct {
	UserID      string `json:"user_id"`      // 用户ID
	ConnectorID int64  `json:"connector_id"` // 连接器ID，默认为0表示全局
	Query       string `json:"query"`        // 搜索关键词
}

// GetMemoryRequest 获取记忆文档请求
type GetMemoryRequest struct {
	UserID      string `json:"user_id"`      // 用户ID
	ConnectorID int64  `json:"connector_id"` // 连接器ID，默认为0表示全局
}

// DocumentMemoryService 文档记忆服务接口
type DocumentMemoryService interface {
	// AddMemory 添加记忆到文档
	AddMemory(ctx context.Context, req *AddMemoryRequest) error

	// SearchMemory 搜索记忆并返回上下文
	SearchMemory(ctx context.Context, req *SearchMemoryRequest) ([]*MemorySearchResult, error)

	// GetMemoryDocument 获取用户的完整记忆文档
	GetMemoryDocument(ctx context.Context, req *GetMemoryRequest) (*UserMemoryDocument, error)

	// IsMemoryEnabled 检查用户是否开启了记忆功能
	IsMemoryEnabled(ctx context.Context, userID string, connectorID int64) (bool, error)

	// EnableMemory 启用记忆功能
	EnableMemory(ctx context.Context, userID string, connectorID int64) error

	// DisableMemory 禁用记忆功能
	DisableMemory(ctx context.Context, userID string, connectorID int64) error
}

// SplitIntoLines 将内容按行分割
func SplitIntoLines(content string) []string {
	return strings.Split(strings.ReplaceAll(content, "\r\n", "\n"), "\n")
}

// GetContextLines 获取指定行号周围的上下文行
func GetContextLines(lines []string, targetLine int, contextLines int) ([]string, int, int) {
	totalLines := len(lines)
	if totalLines == 0 || targetLine < 0 || targetLine >= totalLines {
		return []string{}, -1, -1
	}

	startLine := targetLine - contextLines
	if startLine < 0 {
		startLine = 0
	}

	endLine := targetLine + contextLines
	if endLine >= totalLines {
		endLine = totalLines - 1
	}

	contextResult := make([]string, 0, endLine-startLine+1)
	for i := startLine; i <= endLine; i++ {
		contextResult = append(contextResult, lines[i])
	}

	return contextResult, startLine, endLine
}