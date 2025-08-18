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

package cardselector

import (
	"context"
	"fmt"
	
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

// CardSelector 卡片选择节点实现
type CardSelector struct {
	config      *CardSelectorConfig
	template    string
	fullSources map[string]*schema.SourceInfo
}

// CardSelectorConfig 卡片选择节点配置
type CardSelectorConfig struct {
	Content string `json:"content"` // 输出内容模板
}

// CardItem 卡片项目结构
type CardItem struct {
	ID      string `json:"id"`
	Type    string `json:"type"`    // text, image, video, link
	Content string `json:"content"`
	URL     string `json:"url,omitempty"`     // 对于image, video, link类型
	Title   string `json:"title,omitempty"`   // 对于link类型
}

// NewCardSelector 创建卡片选择节点
func NewCardSelector(config *CardSelectorConfig) *CardSelector {
	return &CardSelector{
		config: config,
	}
}

// SetTemplate 设置输出模板
func (c *CardSelector) SetTemplate(template string) {
	c.template = template
}

// SetFullSources 设置数据源信息，用于模板渲染
func (c *CardSelector) SetFullSources(sources map[string]*schema.SourceInfo) {
	c.fullSources = sources
}

// Invoke 实现InvokableNode接口
func (c *CardSelector) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	// 使用模板渲染系统，效仿Message节点
	if c.template != "" {
		// 使用模板渲染输出
		rendered, err := nodes.Render(ctx, c.template, input, c.fullSources)
		if err != nil {
			return nil, fmt.Errorf("failed to render template: %w", err)
		}

		return map[string]any{
			"output": rendered,
		}, nil
	}

	// 向后兼容：如果没有模板，执行原有的卡片处理逻辑
	// 尝试从任意输入参数中找到卡片数据
	var inputListRaw interface{}
	var found bool

	// 优先查找"input"字段
	if inputListRaw, found = input["input"]; !found {
		// 如果没有input字段，查找其他可能的数据源
		for key, value := range input {
			if key != "output" { // 避免循环引用
				inputListRaw = value
				found = true
				break
			}
		}
	}

	if !found {
		return map[string]any{
			"output": "No input data found",
		}, nil
	}

	// 将输入转换为卡片列表
	cards, err := c.parseInputCards(inputListRaw)
	if err != nil {
		return map[string]any{
			"output": fmt.Sprintf("Failed to parse input: %v", err),
		}, nil
	}

	// 构造输出结果
	outputList := make([]map[string]interface{}, len(cards))
	for i, card := range cards {
		outputList[i] = map[string]interface{}{
			"id":      card.ID,
			"type":    card.Type,
			"content": card.Content,
			"url":     card.URL,
			"title":   card.Title,
		}
	}

	return map[string]any{
		"output": outputList,
	}, nil
}

// parseInputCards 解析输入数据为卡片列表
func (c *CardSelector) parseInputCards(inputListRaw interface{}) ([]*CardItem, error) {
	var cards []*CardItem

	// 处理数组类型输入
	if inputList, ok := inputListRaw.([]interface{}); ok {
		for i, item := range inputList {
			if itemMap, ok := item.(map[string]interface{}); ok {
				card := &CardItem{
					ID: fmt.Sprintf("card_%d", i),
				}

				// 解析内容
				if content, exists := itemMap["content"]; exists {
					if contentStr, ok := content.(string); ok {
						card.Content = contentStr
						card.Type = c.detectCardType(contentStr, itemMap)
					}
				}

				// 解析URL（对于图片、视频、链接）
				if url, exists := itemMap["url"]; exists {
					if urlStr, ok := url.(string); ok {
						card.URL = urlStr
					}
				}

				// 解析标题（对于链接）
				if title, exists := itemMap["title"]; exists {
					if titleStr, ok := title.(string); ok {
						card.Title = titleStr
					}
				}

				cards = append(cards, card)
			}
		}
	}

	return cards, nil
}

// detectCardType 检测卡片类型
func (c *CardSelector) detectCardType(content string, itemMap map[string]interface{}) string {
	// 优先根据显式的type字段判断
	if cardType, exists := itemMap["type"]; exists {
		if typeStr, ok := cardType.(string); ok {
			return typeStr
		}
	}

	// 根据URL后缀推断类型
	if url, exists := itemMap["url"]; exists {
		if urlStr, ok := url.(string); ok {
			if c.isImageURL(urlStr) {
				return "image"
			}
			if c.isVideoURL(urlStr) {
				return "video"
			}
			return "link"
		}
	}

	// 默认为文本类型
	return "text"
}

// isImageURL 检查是否为图片URL
func (c *CardSelector) isImageURL(url string) bool {
	imageExts := []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"}
	for _, ext := range imageExts {
		if len(url) >= len(ext) && url[len(url)-len(ext):] == ext {
			return true
		}
	}
	return false
}

// isVideoURL 检查是否为视频URL
func (c *CardSelector) isVideoURL(url string) bool {
	videoExts := []string{".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"}
	for _, ext := range videoExts {
		if len(url) >= len(ext) && url[len(url)-len(ext):] == ext {
			return true
		}
	}
	return false
}


// ToCallbackOutput 实现CallbackOutputConverted接口
func (c *CardSelector) ToCallbackOutput(ctx context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	return &nodes.StructuredCallbackOutput{
		Output:    out,
		RawOutput: out,
		Extra:     nil,
		Error:     nil,
	}, nil
}