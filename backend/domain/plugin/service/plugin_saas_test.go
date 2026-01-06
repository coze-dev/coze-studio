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

	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	domainDto "github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"

	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
)

func TestSearchSaasPluginResponse_JSONUnmarshal(t *testing.T) {
	// Test JSON data based on the actual API response
	jsonData := `{
		"msg": "",
		"detail": {
			"logid": "2025092821165570E59640C37BF984D370"
		},
		"data": {
			"has_more": true,
			"items": [
				{
					"metainfo": {
						"description": "当你需要获取某些分类的时候，就调用\n",
						"user_info": {
							"nick_name": "testlbsZEOkZJP",
							"avatar_url": "https://p6-passport.byteacctimg.com/img/user-avatar/e67e7ddd636a2087e79d624a64a19359~300x300.image",
							"user_id": "3235179593473241",
							"user_name": "dataEngine_yulu_cn"
						},
						"category": {
							"id": "7327137275714830373",
							"name": "社交"
						},
						"icon_url": "https://p9-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/3be533c88a224f30ac587d577514110c~tplv-13w3uml6bg-resize:128:128.image",
						"product_id": "7546432661141602358",
						"listed_at": 1757337314,
						"is_official": true,
						"entity_type": "plugin",
						"product_url": "https://www.coze.cn/store/plugin/7546432661141602358",
						"entity_id": "7546499763995410451",
						"entity_version": "0",
						"name": "ppe_test_官方付费",
						"paid_type": "paid"
					},
					"plugin_info": {
						"favorite_count": 1,
						"heat": 0,
						"avg_exec_duration_ms": 114.61111,
						"call_count": 20,
						"description": "当你需要获取某些分类的时候，就调用",
						"total_tools_count": 2,
						"bots_use_count": 7,
						"associated_bots_use_count": 0,
						"success_rate": 0.8333349999999999
					}
				}
			]
		},
		"code": 0
	}`

	var searchResp domainDto.SearchSaasPluginResponse
	err := json.Unmarshal([]byte(jsonData), &searchResp)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, 0, searchResp.Code)
	assert.Equal(t, "", searchResp.Msg)

	// Verify detail field
	assert.NotNil(t, searchResp.Detail)
	assert.Equal(t, "2025092821165570E59640C37BF984D370", searchResp.Detail.LogID)

	// Verify data field
	assert.NotNil(t, searchResp.Data)
	assert.True(t, searchResp.Data.HasMore)
	assert.Len(t, searchResp.Data.Items, 1)

	// Verify plugin item
	item := searchResp.Data.Items[0]
	assert.NotNil(t, item.MetaInfo)
	assert.NotNil(t, item.PluginInfo)

	// Verify metainfo fields
	metaInfo := item.MetaInfo
	assert.Equal(t, "7546432661141602358", metaInfo.ProductID)
	assert.Equal(t, "7546499763995410451", metaInfo.EntityID)
	assert.Equal(t, "ppe_test_官方付费", metaInfo.Name)
	assert.Equal(t, "https://www.coze.cn/store/plugin/7546432661141602358", metaInfo.ProductURL)
	assert.True(t, metaInfo.IsOfficial)

	// Verify user_info field (should be string now)
	assert.NotNil(t, metaInfo.UserInfo)
	assert.Equal(t, "3235179593473241", metaInfo.UserInfo.UserID)
	assert.Equal(t, "testlbsZEOkZJP", metaInfo.UserInfo.NickName)

	// Verify plugin_info fields
	pluginInfo := item.PluginInfo
	assert.Equal(t, 1, pluginInfo.FavoriteCount)
	assert.Equal(t, int64(20), pluginInfo.CallCount)
	assert.Equal(t, 2, pluginInfo.TotalToolsCount)
}

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
			FavoriteCount:          1,
			Heat:                   0,
			AvgExecDurationMs:      114.61111,
			CallCount:              20,
			Description:            "Test plugin description",
			TotalToolsCount:        2,
			BotsUseCount:           7,
			AssociatedBotsUseCount: 0,
			SuccessRate:            0.8333349999999999,
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

func TestJsonSchemaTypeUnmarshaling(t *testing.T) {
	// Test JSON data with inputSchema containing type field
	jsonData := `{
		"plugins": [{
			"tools": [{
				"tool_id": "7379227817307029513",
				"description": "当你需要获取网页、pdf、doc、docx、xlsx、csv、text 内容时，使用此工具",
				"name": "LinkReaderPlugin",
				"inputSchema": {
					"required": ["url"],
					"properties": {
						"need_image_url": {
							"description": "是否需要返回图片url",
							"type": "boolean"
						},
						"url": {
							"description": "网页url、pdf url、docx url、csv url、 xlsx url。",
							"type": "string"
						}
					},
					"type": "object"
				},
				"outputSchema": {
					"properties": {
						"data": {
							"properties": {
								"content": {
									"type": "string"
								}
							},
							"type": "object"
						}
					},
					"type": "object"
				}
			}]
		}]
	}`

	var apiResp struct {
		Plugins []struct {
			Tools []struct {
				ToolID       string                `json:"tool_id"`
				Description  string                `json:"description"`
				InputSchema  *domainDto.JsonSchema `json:"inputSchema"`
				Name         string                `json:"name"`
				OutputSchema *domainDto.JsonSchema `json:"outputSchema"`
			} `json:"tools"`
		} `json:"plugins"`
	}

	err := json.Unmarshal([]byte(jsonData), &apiResp)
	assert.NoError(t, err)

	// Verify that we have the expected structure
	assert.Len(t, apiResp.Plugins, 1)
	assert.Len(t, apiResp.Plugins[0].Tools, 1)

	tool := apiResp.Plugins[0].Tools[0]
	assert.Equal(t, "7379227817307029513", tool.ToolID)
	assert.Equal(t, "LinkReaderPlugin", tool.Name)

	// Verify InputSchema type field is correctly parsed
	assert.NotNil(t, tool.InputSchema)
	assert.Equal(t, domainDto.JsonSchemaType_OBJECT, tool.InputSchema.Type)
	assert.Len(t, tool.InputSchema.Required, 1)
	assert.Equal(t, "url", tool.InputSchema.Required[0])

	// Verify properties are correctly parsed with their types
	assert.NotNil(t, tool.InputSchema.Properties)
	assert.Len(t, tool.InputSchema.Properties, 2)

	urlProp := tool.InputSchema.Properties["url"]
	assert.NotNil(t, urlProp)
	assert.Equal(t, domainDto.JsonSchemaType_STRING, urlProp.Type)
	assert.Equal(t, "网页url、pdf url、docx url、csv url、 xlsx url。", urlProp.Description)

	needImageProp := tool.InputSchema.Properties["need_image_url"]
	assert.NotNil(t, needImageProp)
	assert.Equal(t, domainDto.JsonSchemaType_BOOLEAN, needImageProp.Type)
	assert.Equal(t, "是否需要返回图片url", needImageProp.Description)

	// Verify OutputSchema type field is correctly parsed
	assert.NotNil(t, tool.OutputSchema)
	assert.Equal(t, domainDto.JsonSchemaType_OBJECT, tool.OutputSchema.Type)
}

func TestConvertFromJsonSchemaWithFixedType(t *testing.T) {
	// Test the convertFromJsonSchema function
	parameters := repository.ConvertFromJsonSchemaForTest(&dto.JsonSchema{
		Type: dto.JsonSchemaType_OBJECT,
		Properties: map[string]*dto.JsonSchema{
			"url": {
				Type:        dto.JsonSchemaType_STRING,
				Description: "图片的url",
			},
			"return_url": {
				Type:        dto.JsonSchemaType_BOOLEAN,
				Description: "是否需要返回图片url",
			},
		},
		Required: []string{"url"},
	})

	// Debug: print the actual values
	t.Logf("Number of parameters: %d", len(parameters))
	for i, param := range parameters {
		t.Logf("Parameter %d: Name=%s, Location=%d, Type=%d", i, param.Name, param.Location, param.Type)
	}

	// Verify that parameters are correctly generated
	assert.Len(t, parameters, 2)

	// Find the url parameter
	var urlParam, imageParam *pluginCommon.APIParameter
	for _, param := range parameters {
		if param.Name == "url" {
			urlParam = param
		} else if param.Name == "return_url" {
			imageParam = param
		}
	}

	// Verify url parameter
	assert.NotNil(t, urlParam)
	assert.Equal(t, "url", urlParam.Name)
	assert.Equal(t, "图片的url", urlParam.Desc)
	assert.True(t, urlParam.IsRequired)
	assert.Equal(t, pluginCommon.ParameterType_String, urlParam.Type)
	assert.Equal(t, pluginCommon.ParameterLocation_Body, urlParam.Location)

	// Verify return_url parameter
	assert.NotNil(t, imageParam)
	assert.Equal(t, "return_url", imageParam.Name)
	assert.Equal(t, "是否需要返回图片url", imageParam.Desc)
	assert.False(t, imageParam.IsRequired) // not in required array
	assert.Equal(t, pluginCommon.ParameterType_Bool, imageParam.Type)
	assert.Equal(t, pluginCommon.ParameterLocation_Body, imageParam.Location)
}

func TestBatchGetSaasPluginToolsInfoIntegration(t *testing.T) {
	// This test simulates the original issue scenario
	// Create mock response data similar to what was provided in the issue
	respData := `{
		"plugins": [{
			"tools": [{
				"tool_id": "7379227817307029513",
				"description": "当你需要获取网页、pdf、doc、docx、xlsx、csv、text 内容时，使用此工具，可以获取url链接下的标题和内容。由于个别网站自身站点限制，无法获取网页内容。",
				"name": "LinkReaderPlugin",
				"inputSchema": {
					"required": ["url"],
					"properties": {
						"need_image_url": {
							"description": "是否需要返回图片url",
							"type": "boolean"
						},
						"url": {
							"description": "网页url、pdf url、docx url、csv url、 xlsx url。",
							"type": "string"
						}
					},
					"type": "object"
				},
				"outputSchema": {
					"properties": {
						"data": {
							"properties": {
								"images": {
									"items": {
										"properties": {
											"title": {"type": "string"},
											"url": {"type": "string"},
											"width": {"type": "integer"},
											"alt": {"type": "string"},
											"height": {"type": "integer"}
										},
										"type": "object"
									},
									"type": "array"
								},
								"title": {"type": "string"},
								"content": {"type": "string"}
							},
							"type": "object"
						},
						"err_msg": {
							"description": "错误信息",
							"type": "string"
						},
						"error_code": {
							"description": "错误码",
							"type": "string"
						},
						"error_msg": {
							"description": "错误信息",
							"type": "string"
						},
						"message": {
							"description": "错误信息",
							"type": "string"
						},
						"pdf_content": {
							"description": "pdf的内容",
							"type": "string"
						},
						"code": {
							"description": "错误码",
							"type": "integer"
						}
					},
					"type": "object"
				}
			}]
		}]
	}`

	// Simulate the unmarshaling process that happens in BatchGetSaasPluginToolsInfo
	var apiResp struct {
		Plugins []struct {
			Tools []struct {
				ToolID       string                `json:"tool_id"`
				Description  string                `json:"description"`
				InputSchema  *domainDto.JsonSchema `json:"inputSchema"`
				Name         string                `json:"name"`
				OutputSchema *domainDto.JsonSchema `json:"outputSchema"`
			} `json:"tools"`
			McpJSON string `json:"mcp_json"`
		} `json:"plugins"`
	}

	err := json.Unmarshal([]byte(respData), &apiResp)
	assert.NoError(t, err)

	// Verify the structure is correctly parsed
	assert.Len(t, apiResp.Plugins, 1)
	assert.Len(t, apiResp.Plugins[0].Tools, 1)

	tool := apiResp.Plugins[0].Tools[0]

	// Verify InputSchema type is correctly parsed (this was the original issue)
	assert.NotNil(t, tool.InputSchema)
	assert.Equal(t, domainDto.JsonSchemaType_OBJECT, tool.InputSchema.Type)

	// Now test the convertFromJsonSchema function with the parsed schema
	parameters := repository.ConvertFromJsonSchemaForTest(tool.InputSchema)

	// This should NOT be empty anymore (this was the original problem)
	assert.NotEmpty(t, parameters)
	assert.Len(t, parameters, 2)

	// Verify the parameters are correctly generated
	paramMap := make(map[string]*pluginCommon.APIParameter)
	for _, param := range parameters {
		paramMap[param.Name] = param
	}

	// Check url parameter
	urlParam := paramMap["url"]
	assert.NotNil(t, urlParam)
	assert.Equal(t, "url", urlParam.Name)
	assert.True(t, urlParam.IsRequired)
	assert.Equal(t, pluginCommon.ParameterType_String, urlParam.Type)
	assert.Equal(t, pluginCommon.ParameterLocation_Body, urlParam.Location)
	assert.Equal(t, "网页url、pdf url、docx url、csv url、 xlsx url。", urlParam.Desc)

	// Check need_image_url parameter
	imageParam := paramMap["need_image_url"]
	assert.NotNil(t, imageParam)
	assert.Equal(t, "need_image_url", imageParam.Name)
	assert.False(t, imageParam.IsRequired)
	assert.Equal(t, pluginCommon.ParameterType_Bool, imageParam.Type)
	assert.Equal(t, pluginCommon.ParameterLocation_Body, imageParam.Location)
	assert.Equal(t, "是否需要返回图片url", imageParam.Desc)
}
