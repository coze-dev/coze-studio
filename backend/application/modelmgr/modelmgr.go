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

package modelmgr

import (
	"context"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelmgrApplicationService struct {
	TosClient storage.Storage
}

var ModelmgrApplicationSVC = &ModelmgrApplicationService{}

const (
	deprecatedModelTimeAfterDelete = 7 * 24 * time.Hour
)

func (m *ModelmgrApplicationService) GetModelList(ctx context.Context, _ *developer_api.GetTypeListRequest) (
	resp *developer_api.GetTypeListResponse, err error,
) {

	mList, err := config.ModelConf().GetAllModelList(ctx)
	if err != nil {
		return nil, err
	}

	filteredModels := make([]*modelmgr.Model, 0, len(mList))
	for _, mm := range mList {
		if mm.Status == config.ModelStatus_StatusDeleted {
			deleteAt := time.Unix(mm.DeleteAtMs/1000, 0)
			if time.Since(deleteAt) > deprecatedModelTimeAfterDelete {
				logs.CtxDebugf(ctx, "ignore deprecated model, mm: %v", conv.DebugJsonToStr(mm))
				continue
			}
		}

		filteredModels = append(filteredModels, mm)
	}

	locale := i18n.GetLocale(ctx)
	modelList, err := slices.TransformWithErrorCheck(filteredModels, func(mm *modelmgr.Model) (*developer_api.Model, error) {
		return modelDo2To(mm, locale)
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.GetTypeListResponse{
		Code: 0,
		Msg:  "success",
		Data: &developer_api.GetTypeListData{
			ModelList: modelList,
		},
	}, nil
}

func modelDo2To(m *modelmgr.Model, locale i18n.Locale) (*developer_api.Model, error) {
	model := m.Model
	desc := ""
	if model.DisplayInfo.Description != nil {
		desc = ternary.IFElse(locale == i18n.LocaleZH, model.DisplayInfo.Description.ZhCn, model.DisplayInfo.Description.EnUs)
	}

	modelStatusDetails := &developer_api.ModelStatusDetails{}
	if model.Status == config.ModelStatus_StatusDeleted {
		modelStatusDetails.IsUpcomingDeprecated = true
		hideDate := time.Unix(model.DeleteAtMs/1000, 0).Add(deprecatedModelTimeAfterDelete)
		modelStatusDetails.DeprecatedDate = hideDate.Format(time.DateTime)
	}

	return &developer_api.Model{
		Name:             model.DisplayInfo.Name,
		ModelType:        model.ID,
		ModelClass:       model.Provider.ModelClass,
		ModelIcon:        model.Provider.IconURL,
		ModelInputPrice:  0,
		ModelOutputPrice: 0,
		ModelQuota: &developer_api.ModelQuota{
			TokenLimit: int32(model.DisplayInfo.MaxTokens),
			TokenResp:  int32(model.DisplayInfo.OutputTokens),
			// TokenSystem:       0,
			// TokenUserIn:       0,
			// TokenToolsIn:      0,
			// TokenToolsOut:     0,
			// TokenData:         0,
			// TokenHistory:      0,
			// TokenCutSwitch:    false,
			PriceIn:           0,
			PriceOut:          0,
			SystemPromptLimit: nil,
		},
		ModelName:      model.DisplayInfo.Name,
		ModelClassName: model.Provider.ModelClass.String(),
		IsOffline:      false,
		ModelParams:    model.Parameters,
		ModelDesc: []*developer_api.ModelDescGroup{
			{
				GroupName: "Description",
				Desc:      []string{desc},
			},
		},
		FuncConfig:     nil,
		EndpointName:   nil,
		ModelTagList:   nil,
		IsUpRequired:   nil,
		ModelBriefDesc: desc,
		ModelSeries: &developer_api.ModelSeriesInfo{ // TODO: Replace with real configuration
			SeriesName: "热门模型",
		},
		ModelStatusDetails: modelStatusDetails,
		ModelAbility:       model.Capability,
	}, nil
}
