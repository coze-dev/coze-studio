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

package plugin

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	productAPI "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	mockPlugin "github.com/coze-dev/coze-studio/backend/internal/mock/domain/plugin"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestPluginApplicationService_GetCozeSaasPluginList(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockDomainSVC := mockPlugin.NewMockPluginService(ctrl)

	service := &PluginApplicationService{
		DomainSVC: mockDomainSVC,
	}

	ctx := context.Background()
	req := &productAPI.GetProductListRequest{}

	t.Run("Success - Normal case with plugins", func(t *testing.T) {
		// Prepare test data
		testPlugins := []*entity.PluginInfo{
			createTestPluginInfo(1, "Test Plugin 1", "Description 1"),
			createTestPluginInfo(2, "Test Plugin 2", "Description 2"),
		}

		domainResp := &dto.ListPluginProductsResponse{
			Plugins: testPlugins,
			Total:   2,
		}

		// Setup mock expectations
		mockDomainSVC.EXPECT().
			ListSaasPluginProducts(ctx, gomock.Any()).
			Return(domainResp, nil).
			Times(1)

		// Mock BatchGetSaasPluginToolsInfo
		mockDomainSVC.EXPECT().
			BatchGetSaasPluginToolsInfo(ctx, []int64{1, 2}).
			Return(map[int64][]*entity.ToolInfo{
				1: {},
				2: {},
			}, map[int64]*entity.PluginInfo{}, nil).
			Times(1)

		// Execute the method
		resp, err := service.GetCozeSaasPluginList(ctx, req)

		// Assertions
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int32(0), resp.Code)
		assert.Equal(t, "success", resp.Message)
		assert.NotNil(t, resp.Data)
		assert.Equal(t, int32(2), resp.Data.Total)
		assert.False(t, resp.Data.HasMore)
		assert.Len(t, resp.Data.Products, 2)

		// Verify product info conversion
		product1 := resp.Data.Products[0]
		assert.Equal(t, int64(1), product1.MetaInfo.ID)
		assert.Equal(t, int64(1), product1.MetaInfo.EntityID)
		assert.Equal(t, "Test Plugin 1", product1.MetaInfo.Name)
		assert.Equal(t, "Description 1", product1.MetaInfo.Description)
		assert.Equal(t, "https://example.com/icon.png", product1.MetaInfo.IconURL)
		assert.Equal(t, int64(1640995200), product1.MetaInfo.ListedAt)
		assert.NotNil(t, product1.PluginExtra)
		assert.True(t, product1.PluginExtra.IsOfficial) // buildPluginProductExtraInfo always sets IsOfficial to true
	})

	t.Run("Error - ListSaasPluginProducts returns error", func(t *testing.T) {
		// Setup mock to return error
		expectedError := errors.New("failed to fetch SaaS plugins")
		mockDomainSVC.EXPECT().
			ListSaasPluginProducts(ctx, gomock.Any()).
			Return(nil, expectedError).
			Times(1)

		// Execute the method
		resp, err := service.GetCozeSaasPluginList(ctx, req)

		// Assertions
		assert.Error(t, err) // The method returns error when domain service fails
		assert.Nil(t, resp)
		assert.Contains(t, err.Error(), "failed to fetch SaaS plugins")
	})

	t.Run("Success - Empty plugin list", func(t *testing.T) {
		// Prepare empty response
		domainResp := &dto.ListPluginProductsResponse{
			Plugins: []*entity.PluginInfo{},
			Total:   0,
		}

		// Setup mock expectations
		mockDomainSVC.EXPECT().
			ListSaasPluginProducts(ctx, gomock.Any()).
			Return(domainResp, nil).
			Times(1)

		// Mock BatchGetSaasPluginToolsInfo for empty list
		mockDomainSVC.EXPECT().
			BatchGetSaasPluginToolsInfo(ctx, []int64{}).
			Return(map[int64][]*entity.ToolInfo{}, map[int64]*entity.PluginInfo{}, nil).
			Times(1)

		// Execute the method
		resp, err := service.GetCozeSaasPluginList(ctx, req)

		// Assertions
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int32(0), resp.Code)
		assert.Equal(t, "success", resp.Message)
		assert.NotNil(t, resp.Data)
		assert.Equal(t, int32(0), resp.Data.Total)
		assert.False(t, resp.Data.HasMore)
		assert.Len(t, resp.Data.Products, 0)
		assert.Empty(t, resp.Data.Products)
	})

	t.Run("Success - Multiple plugins", func(t *testing.T) {
		// Prepare test data with multiple plugins
		testPlugins := []*entity.PluginInfo{
			createTestPluginInfo(100, "Weather Plugin", "Get weather information"),
			createTestPluginInfo(200, "Translation Plugin", "Translate text between languages"),
			createTestPluginInfo(300, "Calculator Plugin", "Perform mathematical calculations"),
			createTestPluginInfo(400, "News Plugin", "Get latest news updates"),
			createTestPluginInfo(500, "Email Plugin", "Send and manage emails"),
		}

		domainResp := &dto.ListPluginProductsResponse{
			Plugins: testPlugins,
			Total:   5,
		}

		// Setup mock expectations
		mockDomainSVC.EXPECT().
			ListSaasPluginProducts(ctx, gomock.Any()).
			Return(domainResp, nil).
			Times(1)

		// Mock BatchGetSaasPluginToolsInfo for multiple plugins
		mockDomainSVC.EXPECT().
			BatchGetSaasPluginToolsInfo(ctx, []int64{100, 200, 300, 400, 500}).
			Return(map[int64][]*entity.ToolInfo{
				100: {},
				200: {},
				300: {},
				400: {},
				500: {},
			}, map[int64]*entity.PluginInfo{}, nil).
			Times(1)

		// Execute the method
		resp, err := service.GetCozeSaasPluginList(ctx, req)

		// Assertions
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int32(0), resp.Code)
		assert.Equal(t, "success", resp.Message)
		assert.NotNil(t, resp.Data)
		assert.Equal(t, int32(5), resp.Data.Total)
		assert.False(t, resp.Data.HasMore)
		assert.Len(t, resp.Data.Products, 5)

		// Verify all plugins are converted correctly
		expectedNames := []string{"Weather Plugin", "Translation Plugin", "Calculator Plugin", "News Plugin", "Email Plugin"}
		expectedIDs := []int64{100, 200, 300, 400, 500}

		for i, product := range resp.Data.Products {
			assert.Equal(t, expectedIDs[i], product.MetaInfo.ID)
			assert.Equal(t, expectedIDs[i], product.MetaInfo.EntityID)
			assert.Equal(t, expectedNames[i], product.MetaInfo.Name)
			assert.Equal(t, "https://example.com/icon.png", product.MetaInfo.IconURL)
			assert.Equal(t, int64(1640995200), product.MetaInfo.ListedAt)
			assert.NotNil(t, product.PluginExtra)
			assert.True(t, product.PluginExtra.IsOfficial) // buildPluginProductExtraInfo always sets IsOfficial to true
		}
	})
}

// createTestPluginInfo creates a test PluginInfo entity for testing
func createTestPluginInfo(id int64, name, desc string) *entity.PluginInfo {
	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        name,
		NameForHuman:        name,
		DescriptionForModel: desc,
		DescriptionForHuman: desc,
		LogoURL:             "https://example.com/icon.png",
		Auth: &model.AuthV2{
			Type: consts.AuthzTypeOfNone,
		},
		API: model.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &model.PluginInfo{
		ID:           id,
		PluginType:   pluginCommon.PluginType_PLUGIN,
		SpaceID:      0,
		DeveloperID:  0,
		APPID:        nil,
		RefProductID: ptr.Of(id), // Set RefProductID to the same as ID
		IconURI:      ptr.Of("https://example.com/icon.png"),
		ServerURL:    ptr.Of(""),
		CreatedAt:    1640995200, // 2022-01-01 00:00:00
		UpdatedAt:    1640995200,
		SaasPluginExtra: &model.SaasPluginExtraInfo{
			IsOfficial: false,
		},
		Manifest: manifest,
	}

	return entity.NewPluginInfo(pluginInfo)
}

// createTestPluginInfoWithCustomIcon creates a test PluginInfo entity with custom icon for testing
func createTestPluginInfoWithCustomIcon(id int64, name, desc, iconURL string) *entity.PluginInfo {
	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        name,
		NameForHuman:        name,
		DescriptionForModel: desc,
		DescriptionForHuman: desc,
		LogoURL:             iconURL,
		Auth: &model.AuthV2{
			Type: consts.AuthzTypeOfNone,
		},
		API: model.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &model.PluginInfo{
		ID:          id,
		PluginType:  pluginCommon.PluginType_PLUGIN,
		SpaceID:     0,
		DeveloperID: 0,
		APPID:       nil,
		IconURI:     ptr.Of(iconURL),
		ServerURL:   ptr.Of(""),
		CreatedAt:   1640995200,
		UpdatedAt:   1640995200,
		Manifest:    manifest,
	}

	return entity.NewPluginInfo(pluginInfo)
}

// createTestDomainResponse creates a test domain response for testing
func createTestDomainResponse(plugins []*entity.PluginInfo) *dto.ListPluginProductsResponse {
	return &dto.ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}
}
