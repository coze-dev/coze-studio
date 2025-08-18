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
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCardSelector_Invoke(t *testing.T) {
	tests := []struct {
		name        string
		config      *CardSelectorConfig
		input       map[string]any
		expectError bool
		expectKeys  []string
		expectCount int
	}{
		{
			name: "filter all cards",
			config: &CardSelectorConfig{
				FilterType: "all",
				Content:    "test content",
			},
			input: map[string]any{
				"inputList": []interface{}{
					map[string]interface{}{
						"content": "Hello world",
						"type":    "text",
					},
					map[string]interface{}{
						"content": "Image description",
						"type":    "image",
						"url":     "https://example.com/image.jpg",
					},
				},
			},
			expectError: false,
			expectKeys:  []string{"outputList", "filteredCount", "totalCount", "filterType", "processedAt"},
			expectCount: 2,
		},
		{
			name: "filter only text cards",
			config: &CardSelectorConfig{
				FilterType: "text",
				Content:    "test content",
			},
			input: map[string]any{
				"inputList": []interface{}{
					map[string]interface{}{
						"content": "Hello world",
						"type":    "text",
					},
					map[string]interface{}{
						"content": "Image description",
						"type":    "image",
						"url":     "https://example.com/image.jpg",
					},
				},
			},
			expectError: false,
			expectKeys:  []string{"outputList", "filteredCount", "totalCount", "filterType", "processedAt"},
			expectCount: 1,
		},
		{
			name: "filter only image cards",
			config: &CardSelectorConfig{
				FilterType: "image",
				Content:    "test content",
			},
			input: map[string]any{
				"inputList": []interface{}{
					map[string]interface{}{
						"content": "Hello world",
						"type":    "text",
					},
					map[string]interface{}{
						"content": "Image description",
						"type":    "image",
						"url":     "https://example.com/image.jpg",
					},
				},
			},
			expectError: false,
			expectKeys:  []string{"outputList", "filteredCount", "totalCount", "filterType", "processedAt"},
			expectCount: 1,
		},
		{
			name: "missing inputList field",
			config: &CardSelectorConfig{
				FilterType: "all",
				Content:    "test content",
			},
			input: map[string]any{
				"wrongField": "test",
			},
			expectError: true,
		},
		{
			name: "auto-detect image type by URL",
			config: &CardSelectorConfig{
				FilterType: "image",
				Content:    "test content",
			},
			input: map[string]any{
				"inputList": []interface{}{
					map[string]interface{}{
						"content": "Auto-detected image",
						"url":     "https://example.com/photo.png",
					},
				},
			},
			expectError: false,
			expectKeys:  []string{"outputList", "filteredCount", "totalCount", "filterType", "processedAt"},
			expectCount: 1,
		},
		{
			name: "auto-detect video type by URL",
			config: &CardSelectorConfig{
				FilterType: "video",
				Content:    "test content",
			},
			input: map[string]any{
				"inputList": []interface{}{
					map[string]interface{}{
						"content": "Auto-detected video",
						"url":     "https://example.com/video.mp4",
					},
				},
			},
			expectError: false,
			expectKeys:  []string{"outputList", "filteredCount", "totalCount", "filterType", "processedAt"},
			expectCount: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			selector := NewCardSelector(tt.config)

			result, err := selector.Invoke(context.Background(), tt.input)

			if tt.expectError {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.NotNil(t, result)

			for _, key := range tt.expectKeys {
				assert.Contains(t, result, key)
			}

			if tt.expectCount > 0 {
				filteredCount, ok := result["filteredCount"].(int)
				assert.True(t, ok)
				assert.Equal(t, tt.expectCount, filteredCount)
			}
		})
	}
}

func TestCardSelector_DetectCardType(t *testing.T) {
	selector := NewCardSelector(&CardSelectorConfig{})

	tests := []struct {
		name     string
		content  string
		itemMap  map[string]interface{}
		expected string
	}{
		{
			name:    "explicit text type",
			content: "Hello world",
			itemMap: map[string]interface{}{
				"type": "text",
			},
			expected: "text",
		},
		{
			name:    "explicit image type",
			content: "Image description",
			itemMap: map[string]interface{}{
				"type": "image",
				"url":  "https://example.com/image.jpg",
			},
			expected: "image",
		},
		{
			name:    "auto-detect image by .jpg URL",
			content: "Photo",
			itemMap: map[string]interface{}{
				"url": "https://example.com/photo.jpg",
			},
			expected: "image",
		},
		{
			name:    "auto-detect image by .png URL",
			content: "Photo",
			itemMap: map[string]interface{}{
				"url": "https://example.com/photo.png",
			},
			expected: "image",
		},
		{
			name:    "auto-detect video by .mp4 URL",
			content: "Video",
			itemMap: map[string]interface{}{
				"url": "https://example.com/video.mp4",
			},
			expected: "video",
		},
		{
			name:    "auto-detect link by URL without media extension",
			content: "Link",
			itemMap: map[string]interface{}{
				"url": "https://example.com/page",
			},
			expected: "link",
		},
		{
			name:     "default to text when no type info",
			content:  "Plain text",
			itemMap:  map[string]interface{}{},
			expected: "text",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := selector.detectCardType(tt.content, tt.itemMap)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCardSelector_ToCallbackOutput(t *testing.T) {
	selector := NewCardSelector(&CardSelectorConfig{
		FilterType: "text",
	})

	output := map[string]any{
		"filteredCount": 3,
		"totalCount":    5,
		"filterType":    "text",
	}

	result, err := selector.ToCallbackOutput(context.Background(), output)
	
	require.NoError(t, err)
	assert.Equal(t, output, result.Output)
	assert.Equal(t, output, result.RawOutput)
}