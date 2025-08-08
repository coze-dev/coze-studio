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
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/modelmgr"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
	"github.com/coze-dev/coze-studio/backend/domain/model/repository"
	"github.com/coze-dev/coze-studio/backend/domain/model/service"
	inframodelmgr "github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelmgrApplicationService struct {
	Mgr          inframodelmgr.Manager
	TosClient    storage.Storage
	ModelService service.ModelService
	ModelRepo    repository.ModelRepository
}

var ModelmgrApplicationSVC = &ModelmgrApplicationService{}

func (m *ModelmgrApplicationService) GetModelList(ctx context.Context, _ *developer_api.GetTypeListRequest) (
	resp *developer_api.GetTypeListResponse, err error,
) {
	// 一般不太可能同时配置这么多模型
	const modelMaxLimit = 300

	modelResp, err := m.Mgr.ListModel(ctx, &inframodelmgr.ListModelRequest{
		Limit:  modelMaxLimit,
		Cursor: nil,
	})
	if err != nil {
		return nil, err
	}

	locale := i18n.GetLocale(ctx)
	modelList, err := slices.TransformWithErrorCheck(modelResp.ModelList, func(mm *inframodelmgr.Model) (*developer_api.Model, error) {
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

// CreateModel 创建模型
func (m *ModelmgrApplicationService) CreateModel(ctx context.Context, req *modelmgr.CreateModelReq) (*modelmgr.ModelDetail, error) {
	// 转换为实体
	metaEntity := &entity.ModelMeta{
		ModelName: req.Meta.Name,
		Protocol:  req.Meta.Protocol,
		IconURI:   req.IconURI,
		IconURL:   req.IconURL,
		Status:    1, // 默认启用
	}

	// 处理 Capability
	capabilityJSON, err := json.Marshal(req.Meta.Capability)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal capability: %w", err)
	}
	capabilityStr := string(capabilityJSON)
	metaEntity.Capability = &capabilityStr

	// 处理 ConnConfig
	connConfigJSON, err := json.Marshal(req.Meta.ConnConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal conn_config: %w", err)
	}
	connConfigStr := string(connConfigJSON)
	metaEntity.ConnConfig = &connConfigStr

	// 处理 Description
	if len(req.Description) > 0 {
		descJSON, err := json.Marshal(req.Description)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal description: %w", err)
		}
		metaEntity.Description = string(descJSON)
	}

	// 处理 DefaultParameters
	paramsJSON, err := json.Marshal(req.DefaultParameters)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal default_parameters: %w", err)
	}

	modelEntity := &entity.ModelEntity{
		Name:          req.Name,
		DefaultParams: string(paramsJSON),
		Scenario:      1, // 默认场景
		Status:        1, // 默认启用
	}

	// 处理 Description
	if len(req.Description) > 0 {
		descJSON, err := json.Marshal(req.Description)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal description: %w", err)
		}
		descStr := string(descJSON)
		modelEntity.Description = &descStr
	}

	// 调用领域服务创建模型
	if err := m.ModelService.CreateModel(ctx, modelEntity, metaEntity); err != nil {
		return nil, err
	}

	// 返回创建的模型详情
	return m.convertToModelDetail(modelEntity, metaEntity), nil
}

// GetModel 获取模型详情
func (m *ModelmgrApplicationService) GetModel(ctx context.Context, modelID string) (*modelmgr.ModelDetail, error) {
	id, err := strconv.ParseUint(modelID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid model id: %w", err)
	}

	model, meta, err := m.ModelService.GetModel(ctx, id)
	if err != nil {
		return nil, err
	}

	return m.convertToModelDetail(model, meta), nil
}

// UpdateModel 更新模型
func (m *ModelmgrApplicationService) UpdateModel(ctx context.Context, req *modelmgr.UpdateModelReq) (*modelmgr.ModelDetail, error) {
	id, err := strconv.ParseUint(req.ModelID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid model id: %w", err)
	}

	// 获取现有模型
	model, meta, err := m.ModelService.GetModel(ctx, id)
	if err != nil {
		return nil, err
	}

	// 更新字段
	if req.Name != nil {
		model.Name = *req.Name
	}
	if req.IconURI != nil {
		meta.IconURI = *req.IconURI
	}
	if req.IconURL != nil {
		meta.IconURL = *req.IconURL
	}
	if req.Status != nil {
		model.Status = *req.Status
		meta.Status = *req.Status
	}
	if len(req.Description) > 0 {
		descJSON, err := json.Marshal(req.Description)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal description: %w", err)
		}
		descStr := string(descJSON)
		model.Description = &descStr
	}
	if len(req.DefaultParameters) > 0 {
		paramsJSON, err := json.Marshal(req.DefaultParameters)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal default_parameters: %w", err)
		}
		model.DefaultParams = string(paramsJSON)
	}

	// 更新模型
	if err := m.ModelService.UpdateModel(ctx, model); err != nil {
		return nil, err
	}
	if err := m.ModelService.UpdateModelMeta(ctx, meta); err != nil {
		return nil, err
	}

	// 刷新缓存
	if err := m.Mgr.RefreshCache(ctx, int64(id)); err != nil {
		logs.CtxWarnf(ctx, "failed to refresh model cache, id=%d, err=%v", id, err)
		// 不中断流程，只记录警告
	}

	return m.convertToModelDetail(model, meta), nil
}

// DeleteModel 删除模型
func (m *ModelmgrApplicationService) DeleteModel(ctx context.Context, modelID string) error {
	id, err := strconv.ParseUint(modelID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid model id: %w", err)
	}

	if err := m.ModelService.DeleteModel(ctx, id); err != nil {
		return err
	}

	// 删除缓存
	if err := m.Mgr.RefreshCache(ctx, int64(id)); err != nil {
		logs.CtxWarnf(ctx, "failed to refresh model cache after delete, id=%d, err=%v", id, err)
		// 不中断流程，只记录警告
	}

	return nil
}

// AddModelToSpace 添加模型到空间
func (m *ModelmgrApplicationService) AddModelToSpace(ctx context.Context, spaceID, modelID string, userID uint64) error {
	sid, err := strconv.ParseUint(spaceID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid space id: %w", err)
	}

	mid, err := strconv.ParseUint(modelID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid model id: %w", err)
	}

	return m.ModelService.AddModelToSpace(ctx, sid, mid, userID)
}

// RemoveModelFromSpace 从空间移除模型
func (m *ModelmgrApplicationService) RemoveModelFromSpace(ctx context.Context, spaceID, modelID string) error {
	sid, err := strconv.ParseUint(spaceID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid space id: %w", err)
	}

	mid, err := strconv.ParseUint(modelID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid model id: %w", err)
	}

	return m.ModelService.RemoveModelFromSpace(ctx, sid, mid)
}

// UpdateSpaceModelConfig 更新空间模型配置
func (m *ModelmgrApplicationService) UpdateSpaceModelConfig(ctx context.Context, spaceID, modelID string, config map[string]interface{}) error {
	sid, err := strconv.ParseUint(spaceID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid space id: %w", err)
	}

	mid, err := strconv.ParseUint(modelID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid model id: %w", err)
	}

	if err := m.ModelService.UpdateSpaceModelConfig(ctx, sid, mid, config); err != nil {
		return err
	}

	// 刷新缓存
	if err := m.Mgr.RefreshCache(ctx, int64(mid)); err != nil {
		logs.CtxWarnf(ctx, "failed to refresh model cache after config update, id=%d, err=%v", mid, err)
		// 不中断流程，只记录警告
	}

	return nil
}

// convertToModelDetail 转换为模型详情
func (m *ModelmgrApplicationService) convertToModelDetail(model *entity.ModelEntity, meta *entity.ModelMeta) *modelmgr.ModelDetail {
	detail := &modelmgr.ModelDetail{
		ID:        strconv.FormatUint(model.ID, 10),
		Name:      model.Name,
		IconURI:   meta.IconURI,
		IconURL:   meta.IconURL,
		CreatedAt: int64(model.CreatedAt),
		UpdatedAt: int64(model.UpdatedAt),
		Meta: modelmgr.ModelMetaOutput{
			ID:       strconv.FormatUint(meta.ID, 10),
			Name:     meta.ModelName,
			Protocol: meta.Protocol,
			Status:   meta.Status,
		},
	}

	// 处理 Description
	if model.Description != nil && *model.Description != "" {
		var desc map[string]string
		if err := json.Unmarshal([]byte(*model.Description), &desc); err == nil {
			detail.Description = desc
		}
	}

	// 处理 DefaultParameters
	if model.DefaultParams != "" {
		var params []modelmgr.ModelParameterOutput
		if err := json.Unmarshal([]byte(model.DefaultParams), &params); err == nil {
			detail.DefaultParameters = params
		}
	}

	// 处理 Capability
	if meta.Capability != nil && *meta.Capability != "" {
		var cap modelmgr.ModelCapability
		if err := json.Unmarshal([]byte(*meta.Capability), &cap); err == nil {
			detail.Meta.Capability = cap
		}
	}

	// 处理 ConnConfig
	if meta.ConnConfig != nil && *meta.ConnConfig != "" {
		var config map[string]interface{}
		if err := json.Unmarshal([]byte(*meta.ConnConfig), &config); err == nil {
			detail.Meta.ConnConfig = config
		}
	}

	return detail
}

func modelDo2To(model *inframodelmgr.Model, locale i18n.Locale) (*developer_api.Model, error) {
	mm := model.Meta

	mps := slices.Transform(model.DefaultParameters,
		func(param *inframodelmgr.Parameter) *developer_api.ModelParameter {
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
		ModelName:      mm.Name,
		ModelClassName: mm.Protocol.TOModelClass().String(),
		IsOffline:      mm.Status != inframodelmgr.StatusInUse,
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
		ModelSeries: &developer_api.ModelSeriesInfo{ // TODO: 替换为真实配置
			SeriesName: "热门模型",
		},
		ModelStatusDetails: nil,
		ModelAbility: &developer_api.ModelAbility{
			CotDisplay:         ptr.Of(mm.Capability.Reasoning),
			FunctionCall:       ptr.Of(mm.Capability.FunctionCall),
			ImageUnderstanding: ptr.Of(modalSet.Contains(inframodelmgr.ModalImage)),
			VideoUnderstanding: ptr.Of(modalSet.Contains(inframodelmgr.ModalVideo)),
			AudioUnderstanding: ptr.Of(modalSet.Contains(inframodelmgr.ModalAudio)),
			SupportMultiModal:  ptr.Of(len(modalSet) > 1),
			PrefillResp:        ptr.Of(mm.Capability.PrefillResponse),
		},
	}, nil
}

func parameterDo2To(param *inframodelmgr.Parameter, locale i18n.Locale) *developer_api.ModelParameter {
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
	if val, ok := param.DefaultVal[inframodelmgr.DefaultTypeDefault]; ok {
		custom = val
	}

	if val, ok := param.DefaultVal[inframodelmgr.DefaultTypeCreative]; ok {
		creative = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[inframodelmgr.DefaultTypeBalance]; ok {
		balance = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[inframodelmgr.DefaultTypePrecise]; ok {
		precise = ptr.Of(val)
	}

	return &developer_api.ModelParameter{
		Name:  string(param.Name),
		Label: param.Label.Read(locale),
		Desc:  param.Desc.Read(locale),
		Type: func() developer_api.ModelParamType {
			switch param.Type {
			case inframodelmgr.ValueTypeBoolean:
				return developer_api.ModelParamType_Boolean
			case inframodelmgr.ValueTypeInt:
				return developer_api.ModelParamType_Int
			case inframodelmgr.ValueTypeFloat:
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
				case inframodelmgr.WidgetSlider:
					return 1
				case inframodelmgr.WidgetRadioButtons:
					return 2
				default:
					return 0
				}
			}(),
			Label: param.Style.Label.Read(locale),
		},
	}
}
