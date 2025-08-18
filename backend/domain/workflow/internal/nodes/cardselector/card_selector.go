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
	"time"
	
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

// CardSelector 卡片选择节点实现
type CardSelector struct {
	config *CardSelectorConfig
}

// CardSelectorConfig 卡片选择节点配置
type CardSelectorConfig struct {
	FilterType string `json:"filter_type"` // 筛选类型：all, text, image, video, link
	Content    string `json:"content"`     // 输出内容模板
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

// Invoke 实现InvokableNode接口
func (c *CardSelector) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	// 提取输入参数
	inputListRaw, ok := input["inputList"]
	if !ok {
		return nil, fmt.Errorf("missing inputList field")
	}

	// 将输入转换为卡片列表
	cards, err := c.parseInputCards(inputListRaw)
	if err != nil {
		return nil, fmt.Errorf("failed to parse input cards: %w", err)
	}

	// 根据筛选条件过滤卡片
	filteredCards := c.filterCards(cards, c.config.FilterType)

	// 构造输出结果
	outputList := make([]map[string]interface{}, len(filteredCards))
	for i, card := range filteredCards {
		outputList[i] = map[string]interface{}{
			"id":      card.ID,
			"content": card.Content,
		}
	}

	return map[string]any{
		"outputList":    outputList,
		"filteredCount": len(filteredCards),
		"totalCount":    len(cards),
		"filterType":    c.config.FilterType,
		"processedAt":   time.Now().Format(time.RFC3339),
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

// filterCards 根据筛选类型过滤卡片
func (c *CardSelector) filterCards(cards []*CardItem, filterType string) []*CardItem {
	if filterType == "all" || filterType == "" {
		return cards
	}

	var filtered []*CardItem
	for _, card := range cards {
		if card.Type == filterType {
			filtered = append(filtered, card)
		}
	}

	return filtered
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