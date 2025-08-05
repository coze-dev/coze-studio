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

package space

import (
	"github.com/coze-dev/coze-studio/backend/api/model/base"
	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
)

type GetSpaceModelListReq struct {
	SpaceID string `json:"space_id" binding:"required"`
}

type SpaceModelItem struct {
	ID            string                 `json:"id"`
	Name          string                 `json:"name"`
	Description   string                 `json:"description"`
	ContextLength int64                  `json:"context_length"`
	IconURI       string                 `json:"icon_uri"`
	Protocol      string                 `json:"protocol"`
	CustomConfig  map[string]interface{} `json:"custom_config,omitempty"`
}

type SpaceModelListData struct {
	Models []*SpaceModelItem `json:"models"`
}

type GetSpaceModelListResp struct {
	*base.BaseResp
	Data *SpaceModelListData `json:"data"`
}

// ConvertToSpaceModelItem 将 domain entity 转换为 API model
func ConvertToSpaceModelItem(model *entity.SpaceModelView) *SpaceModelItem {
	return &SpaceModelItem{
		ID:            model.ID,
		Name:          model.Name,
		Description:   model.Description,
		ContextLength: model.ContextLength,
		IconURI:       model.IconURI,
		Protocol:      model.Protocol,
		CustomConfig:  model.CustomConfig,
	}
}