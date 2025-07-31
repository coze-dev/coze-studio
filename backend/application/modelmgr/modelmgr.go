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

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelmgrApplicationService struct {
	Mgr       modelmgr.Manager
	TosClient storage.Storage
}

var ModelmgrApplicationSVC = &ModelmgrApplicationService{}

func (m *ModelmgrApplicationService) GetModelList(ctx context.Context, _ *developer_api.GetTypeListRequest) (
	resp *developer_api.GetTypeListResponse, err error,
) {
	// It is generally not possible to configure so many models simultaneously
	const modelMaxLimit = 300

	modelResp, err := m.Mgr.ListModel(ctx, &modelmgr.ListModelRequest{
		Limit:  modelMaxLimit,
		Cursor: nil,
	})
	if err != nil {
		return nil, err
	}

	locale := i18n.GetLocale(ctx)
	modelList, err := slices.TransformWithErrorCheck(modelResp.ModelList, func(mm *modelmgr.Model) (*developer_api.Model, error) {
		logs.CtxInfof(ctx, "ChatModel DefaultParameters: %v", mm.DefaultParameters)
		if mm.IconURI != "" {
			iconUrl, err := m.TosClient.GetObjectUrl(ctx, mm.IconURI)
			if err == nil {
				mm.IconURL = iconUrl
			}
		}
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

func modelDo2To(model *modelmgr.Model, locale i18n.Locale) (*developer_api.Model, error) {
	mm := model.Meta

	mps := slices.Transform(model.DefaultParameters,
		func(param *modelmgr.Parameter) *developer_api.ModelParameter {
			return parameterDo2To(param, locale)
		},
	)

	modalSet := sets.FromSlice(mm.Capability.InputModal)

	return &developer_api.Model{
		Name:             model.Name,
		ModelType:        model.ID,
		ModelClass:       mm.Protocol.TOModelClass(),
		ModelIcon:        model.IconURL,
		ModelInputPrice:  0,
		ModelOutputPrice: 0,
		ModelQuota: &developer_api.ModelQuota{
			TokenLimit: int32(mm.Capability.MaxTokens),
			TokenResp:  int32(mm.Capability.OutputTokens),
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
		ModelName:      model.Name,
		ModelClassName: mm.Protocol.TOModelClass().String(),
		IsOffline:      mm.Status != modelmgr.StatusInUse,
		ModelParams:    mps,
		ModelDesc: []*developer_api.ModelDescGroup{
			{
				GroupName: "Description",
				Desc:      []string{model.Description.Read(locale)},
			},
		},
		FuncConfig:     nil,
		EndpointName:   nil,
		ModelTagList:   nil,
		IsUpRequired:   nil,
		ModelBriefDesc: model.Description.Read(locale),
		ModelSeries: &developer_api.ModelSeriesInfo{ // TODO: Replace with real configuration
			SeriesName: "热门模型",
		},
		ModelStatusDetails: nil,
		ModelAbility: &developer_api.ModelAbility{
			CotDisplay:         ptr.Of(mm.Capability.Reasoning),
			FunctionCall:       ptr.Of(mm.Capability.FunctionCall),
			ImageUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalImage)),
			VideoUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalVideo)),
			AudioUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalAudio)),
			SupportMultiModal:  ptr.Of(len(modalSet) > 1),
			PrefillResp:        ptr.Of(mm.Capability.PrefillResponse),
		},
	}, nil
}

func parameterDo2To(param *modelmgr.Parameter, locale i18n.Locale) *developer_api.ModelParameter {
	if param == nil {
		return nil
	}

	apiOptions := make([]*developer_api.Option, 0, len(param.Options))
	for _, opt := range param.Options {
		apiOptions = append(apiOptions, &developer_api.Option{
			Label: opt.Label,
			Value: opt.Value,
		})
	}

	var custom string
	var creative, balance, precise *string
	if val, ok := param.DefaultVal[modelmgr.DefaultTypeDefault]; ok {
		custom = val
	}

	if val, ok := param.DefaultVal[modelmgr.DefaultTypeCreative]; ok {
		creative = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelmgr.DefaultTypeBalance]; ok {
		balance = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelmgr.DefaultTypePrecise]; ok {
		precise = ptr.Of(val)
	}

	return &developer_api.ModelParameter{
		Name:  string(param.Name),
		Label: param.Label.Read(locale),
		Desc:  param.Desc.Read(locale),
		Type: func() developer_api.ModelParamType {
			switch param.Type {
			case modelmgr.ValueTypeBoolean:
				return developer_api.ModelParamType_Boolean
			case modelmgr.ValueTypeInt:
				return developer_api.ModelParamType_Int
			case modelmgr.ValueTypeFloat:
				return developer_api.ModelParamType_Float
			default:
				return developer_api.ModelParamType_String
			}
		}(),
		Min:       param.Min,
		Max:       param.Max,
		Precision: int32(param.Precision),
		DefaultVal: &developer_api.ModelParamDefaultValue{
			DefaultVal: custom,
			Creative:   creative,
			Balance:    balance,
			Precise:    precise,
		},
		Options: apiOptions,
		ParamClass: &developer_api.ModelParamClass{
			ClassID: func() int32 {
				switch param.Style.Widget {
				case modelmgr.WidgetSlider:
					return 1
				case modelmgr.WidgetRadioButtons:
					return 2
				default:
					return 0
				}
			}(),
			Label: param.Style.Label.Read(locale),
		},
	}
}
