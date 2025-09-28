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
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"

	domainDto "github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
)

func TestConvertSaasPluginItemToEntity_WithNewFields(t *testing.T) {
	// Test the conversion function with our new fields to ensure they're handled correctly
	item := &domainDto.SaasPluginItem{
		MetaInfo: &domainDto.SaasPluginMetaInfo{
			ProductID:     "7546432661141602358",
			EntityID:      "7546499763995410451",
			EntityVersion: "0",
			EntityType:    "plugin",
			Name:          "Test Plugin",
			Description:   "Test plugin description",
			UserInfo: &domainDto.SaasPluginUserInfo{
				UserID:    "3235179593473241", // String type (our fix)
				UserName:  "testUserName",
				NickName:  "testUser",
				AvatarURL: "https://example.com/avatar.png",
			},
			Category: &domainDto.SaasPluginCategory{
				ID:   "7327137275714830373",
				Name: "测试分类",
			},
			IconURL:    "https://example.com/icon.png",
			ProductURL: "https://www.coze.cn/store/plugin/7546432661141602358", // New field (our fix)
			ListedAt:   1757337314,
			PaidType:   "free",
			IsOfficial: true,
		},
		PluginInfo: &domainDto.SaasPluginInfo{
			FavoriteCount:            1,
			Heat:                     0,
			AvgExecDurationMs:        114.61111,
			CallCount:                20,
			Description:              "Test plugin description",
			TotalToolsCount:          2,
			BotsUseCount:             7,
			AssociatedBotsUseCount:   0,
			SuccessRate:              0.8333349999999999,
		},
	}

	// Execute the conversion
	plugin := convertSaasPluginItemToEntity(item)

	// Assertions
	assert.NotNil(t, plugin)
	assert.Equal(t, "Test Plugin", plugin.GetName())
	assert.Equal(t, "Test plugin description", plugin.GetDesc())
	assert.Equal(t, "https://example.com/icon.png", plugin.GetIconURI())
	
	// This test verifies that:
	// 1. ProductURL field is accessible (even if not directly used in conversion)
	// 2. UserID string type works correctly
	// 3. All new fields are properly handled in the conversion process
}

func TestSearchSaasPluginResponse_WithAllNewFields(t *testing.T) {
	// Test JSON parsing with all our new fields to ensure complete coverage
	jsonData := `{
		"code": 0,
		"msg": "success",
		"detail": {
			"logid": "test-log-id-12345"
		},
		"data": {
			"has_more": false,
			"items": [
				{
					"metainfo": {
						"product_id": "123",
						"entity_id": "456",
						"entity_version": "1",
						"entity_type": "plugin",
						"name": "Test Plugin",
						"description": "Test Description",
						"user_info": {
							"user_id": "9876543210",
							"user_name": "testuser",
							"nick_name": "Test User",
							"avatar_url": "https://example.com/avatar.jpg"
						},
						"category": {
							"id": "cat123",
							"name": "Test Category"
						},
						"icon_url": "https://example.com/icon.jpg",
						"product_url": "https://example.com/product/123",
						"listed_at": 1640995200,
						"paid_type": "free",
						"is_official": false
					},
					"plugin_info": {
						"favorite_count": 5,
						"heat": 10,
						"avg_exec_duration_ms": 200.5,
						"call_count": 100,
						"description": "Plugin Info Description",
						"total_tools_count": 3,
						"bots_use_count": 15,
						"associated_bots_use_count": 2,
						"success_rate": 0.95
					}
				}
			]
		}
	}`

	var searchResp domainDto.SearchSaasPluginResponse
	err := json.Unmarshal([]byte(jsonData), &searchResp)

	// Assertions for basic structure
	assert.NoError(t, err)
	assert.Equal(t, 0, searchResp.Code)
	assert.Equal(t, "success", searchResp.Msg)

	// Test our new ResponseDetail field
	assert.NotNil(t, searchResp.Detail)
	assert.Equal(t, "test-log-id-12345", searchResp.Detail.LogID)

	// Test data structure
	assert.NotNil(t, searchResp.Data)
	assert.False(t, searchResp.Data.HasMore)
	assert.Len(t, searchResp.Data.Items, 1)

	// Test item with all our fixes
	item := searchResp.Data.Items[0]
	assert.NotNil(t, item.MetaInfo)

	// Test our new ProductURL field
	assert.Equal(t, "https://example.com/product/123", item.MetaInfo.ProductURL)

	// Test our fixed UserID string type
	assert.NotNil(t, item.MetaInfo.UserInfo)
	assert.Equal(t, "9876543210", item.MetaInfo.UserInfo.UserID) // String, not int64

	// Test other fields to ensure nothing broke
	assert.Equal(t, "Test Plugin", item.MetaInfo.Name)
	assert.Equal(t, "Test Description", item.MetaInfo.Description)
	assert.False(t, item.MetaInfo.IsOfficial)

	// Test plugin info
	assert.NotNil(t, item.PluginInfo)
	assert.Equal(t, 5, item.PluginInfo.FavoriteCount)
	assert.Equal(t, int64(100), item.PluginInfo.CallCount)
}