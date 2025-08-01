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

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/application/base/appinfra"
	wfmodel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	crossmodel "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
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

// RefreshModels 重新加载模型配置
func (m *ModelmgrApplicationService) RefreshModels(ctx context.Context, _ *developer_api.RefreshModelsRequest) (
	resp *developer_api.RefreshModelsResponse, err error,
) {
	logs.CtxInfof(ctx, "[RefreshModels] Starting model configuration refresh")

	// 获取当前模型列表用于比较
	oldModelResp, err := m.Mgr.ListModel(ctx, &modelmgr.ListModelRequest{
		Limit: 300,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[RefreshModels] Failed to get old model list: %v", err)
		return nil, err
	}

	// 创建旧模型名称映射
	oldModelMap := make(map[string]bool)
	for _, model := range oldModelResp.ModelList {
		oldModelMap[model.Name] = true
	}

	// 重新加载模型配置
	newMgr, err := appinfra.ReloadModelMgr()
	if err != nil {
		logs.CtxErrorf(ctx, "[RefreshModels] Failed to reload model manager: %v", err)
		return &developer_api.RefreshModelsResponse{
			Code: -1,
			Msg:  "Failed to reload model configurations: " + err.Error(),
		}, nil
	}

	// 更新当前管理器
	m.Mgr = newMgr

	// 同时更新 workflow 模块的全局模型管理器
	workflowModelMgr := wfmodel.NewModelManager(newMgr, nil)
	crossmodel.SetManager(workflowModelMgr)
	logs.CtxInfof(ctx, "[RefreshModels] Updated workflow ModelManager")

	// 获取新模型列表
	newModelResp, err := m.Mgr.ListModel(ctx, &modelmgr.ListModelRequest{
		Limit: 300,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[RefreshModels] Failed to get new model list: %v", err)
		return nil, err
	}

	// 比较新旧模型列表
	var newModels, updatedModels []string
	for _, model := range newModelResp.ModelList {
		if !oldModelMap[model.Name] {
			newModels = append(newModels, model.Name)
		} else {
			// 这里可以进一步比较模型配置是否有变化
			updatedModels = append(updatedModels, model.Name)
		}
	}

	refreshTime := time.Now().Format("2006-01-02 15:04:05")

	logs.CtxInfof(ctx, "[RefreshModels] Refresh completed. Total: %d, New: %d, Updated: %d",
		len(newModelResp.ModelList), len(newModels), len(updatedModels))

	return &developer_api.RefreshModelsResponse{
		Code: 0,
		Msg:  "Model configurations refreshed successfully",
		Data: &developer_api.RefreshModelsData{
			ModelCount:    int32(len(newModelResp.ModelList)),
			NewModels:     newModels,
			UpdatedModels: updatedModels,
			RefreshTime:   refreshTime,
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
