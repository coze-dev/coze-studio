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
