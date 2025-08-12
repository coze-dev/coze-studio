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
	oceanmodelmgr "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/modelmgr"
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

// ListModels 获取模型列表（新接口）
func (m *ModelmgrApplicationService) ListModels(ctx context.Context, req *oceanmodelmgr.ListModelsRequest) (*oceanmodelmgr.ListModelsResponse, error) {
	// 构建查询请求
	listReq := &inframodelmgr.ListModelRequest{
		Limit: int(req.GetPageSize()),
	}

	// 设置分页参数
	if req.GetPageToken() != "" {
		listReq.Cursor = ptr.Of(req.GetPageToken())
	}

	// 设置默认页大小
	if listReq.Limit <= 0 {
		listReq.Limit = 20
	}
	if listReq.Limit > 100 {
		listReq.Limit = 100 // 最大限制
	}

	// 处理过滤条件
	if req.GetFilter() != "" {
		listReq.FuzzyModelName = ptr.Of(req.GetFilter())
	}

	// 处理空间ID过滤
	if req.GetSpaceID() != "" {
		spaceID, err := strconv.ParseUint(req.GetSpaceID(), 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid space_id: %w", err)
		}
		listReq.SpaceID = ptr.Of(spaceID)
	}

	// 调用基础设施层获取模型列表
	modelResp, err := m.Mgr.ListModel(ctx, listReq)
	if err != nil {
		return nil, fmt.Errorf("failed to list models: %w", err)
	}

	// 转换模型数据
	modelDetailList := make([]*oceanmodelmgr.ModelDetailOutput, 0, len(modelResp.ModelList))
	for _, model := range modelResp.ModelList {
		// 处理图标URL
		if model.IconURI != "" && m.TosClient != nil {
			iconUrl, err := m.TosClient.GetObjectUrl(ctx, model.IconURI)
			if err == nil {
				model.IconURL = iconUrl
			}
		}

		// 转换为API格式
		detail, err := m.convertToModelDetailOutput(model)
		if err != nil {
			logs.CtxWarnf(ctx, "failed to convert model, id=%d, err=%v", model.ID, err)
			continue
		}
		modelDetailList = append(modelDetailList, detail)
	}

	// 构建响应
	resp := &oceanmodelmgr.ListModelsResponse{
		Data:       modelDetailList,
		TotalCount: ptr.Of(int32(len(modelDetailList))),
		Code:       0,
		Msg:        "success",
	}

	// 设置下一页令牌
	if modelResp.HasMore && modelResp.NextCursor != nil {
		resp.NextPageToken = modelResp.NextCursor
	}

	return resp, nil
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

// convertToModelDetailOutput 转换为新的API格式
func (m *ModelmgrApplicationService) convertToModelDetailOutput(model *inframodelmgr.Model) (*oceanmodelmgr.ModelDetailOutput, error) {
	detail := &oceanmodelmgr.ModelDetailOutput{
		ID:        strconv.FormatInt(model.ID, 10),
		Name:      model.Name,
		CreatedAt: int64(model.ID), // 临时使用ID作为创建时间，实际应该从数据库获取
		UpdatedAt: int64(model.ID), // 临时使用ID作为更新时间，实际应该从数据库获取
	}

	// 设置图标信息
	if model.IconURI != "" {
		detail.IconURI = ptr.Of(model.IconURI)
	}
	if model.IconURL != "" {
		detail.IconURL = ptr.Of(model.IconURL)
	}

	// 处理多语言描述
	if model.Description != nil {
		descMap := make(map[string]string)
		if model.Description.ZH != "" {
			descMap["zh"] = model.Description.ZH
		}
		if model.Description.EN != "" {
			descMap["en"] = model.Description.EN
		}
		if len(descMap) > 0 {
			detail.Description = descMap
		}
	}

	// 转换默认参数
	if len(model.DefaultParameters) > 0 {
		params := make([]*oceanmodelmgr.ModelParameterOutput, 0, len(model.DefaultParameters))
		for _, param := range model.DefaultParameters {
			apiParam, err := m.convertToModelParameterOutput(param)
			if err != nil {
				logs.Warnf("failed to convert parameter %s: %v", param.Name, err)
				continue
			}
			params = append(params, apiParam)
		}
		detail.DefaultParameters = params
	}

	// 转换模型元数据
	meta, err := m.convertToModelMetaOutput(&model.Meta)
	if err != nil {
		return nil, fmt.Errorf("failed to convert meta: %w", err)
	}
	detail.Meta = meta

	return detail, nil
}

// convertToModelParameterOutput 转换模型参数
func (m *ModelmgrApplicationService) convertToModelParameterOutput(param *inframodelmgr.Parameter) (*oceanmodelmgr.ModelParameterOutput, error) {
	apiParam := &oceanmodelmgr.ModelParameterOutput{
		Name: string(param.Name),
		Type: string(param.Type),
	}

	// 转换多语言标签
	if param.Label != nil {
		labelMap := make(map[string]string)
		if param.Label.ZH != "" {
			labelMap["zh"] = param.Label.ZH
		}
		if param.Label.EN != "" {
			labelMap["en"] = param.Label.EN
		}
		apiParam.Label = labelMap
	}

	// 转换多语言描述
	if param.Desc != nil {
		descMap := make(map[string]string)
		if param.Desc.ZH != "" {
			descMap["zh"] = param.Desc.ZH
		}
		if param.Desc.EN != "" {
			descMap["en"] = param.Desc.EN
		}
		apiParam.Desc = descMap
	}

	// 设置范围
	if param.Min != "" {
		apiParam.Min = ptr.Of(param.Min)
	}
	if param.Max != "" {
		apiParam.Max = ptr.Of(param.Max)
	}

	// 转换默认值
	defaultValMap := make(map[string]string)
	for key, val := range param.DefaultVal {
		defaultValMap[string(key)] = val
	}
	apiParam.DefaultVal = defaultValMap

	// 设置精度
	if param.Precision > 0 {
		apiParam.Precision = ptr.Of(int32(param.Precision))
	}

	// 转换选项
	if len(param.Options) > 0 {
		options := make([]*oceanmodelmgr.ModelParamOption, 0, len(param.Options))
		for _, opt := range param.Options {
			options = append(options, &oceanmodelmgr.ModelParamOption{
				Label: ptr.Of(opt.Label),
				Value: ptr.Of(opt.Value),
			})
		}
		apiParam.Options = options
	}

	// 转换显示样式
	style := &oceanmodelmgr.ParamDisplayStyle{
		Widget: string(param.Style.Widget),
	}
	if param.Style.Label != nil {
		labelMap := make(map[string]string)
		if param.Style.Label.ZH != "" {
			labelMap["zh"] = param.Style.Label.ZH
		}
		if param.Style.Label.EN != "" {
			labelMap["en"] = param.Style.Label.EN
		}
		style.Label = labelMap
	}
	apiParam.Style = style

	return apiParam, nil
}

// convertToModelMetaOutput 转换模型元数据
func (m *ModelmgrApplicationService) convertToModelMetaOutput(meta *inframodelmgr.ModelMeta) (*oceanmodelmgr.ModelMetaOutput, error) {
	apiMeta := &oceanmodelmgr.ModelMetaOutput{
		ID:       strconv.FormatInt(int64(meta.Status), 10), // 临时使用status作为ID
		Name:     meta.Name,
		Protocol: string(meta.Protocol),
		Status:   int32(meta.Status),
	}

	// 转换能力信息
	if meta.Capability != nil {
		capability := &oceanmodelmgr.ModelCapability{
			FunctionCall:    ptr.Of(meta.Capability.FunctionCall),
			JSONMode:        ptr.Of(meta.Capability.JSONMode),
			MaxTokens:       ptr.Of(int32(meta.Capability.MaxTokens)),
			PrefixCaching:   ptr.Of(meta.Capability.PrefixCaching),
			Reasoning:       ptr.Of(meta.Capability.Reasoning),
			PrefillResponse: ptr.Of(meta.Capability.PrefillResponse),
		}

		// 转换输入模态
		if len(meta.Capability.InputModal) > 0 {
			inputModal := make([]string, 0, len(meta.Capability.InputModal))
			for _, modal := range meta.Capability.InputModal {
				inputModal = append(inputModal, string(modal))
			}
			capability.InputModal = inputModal
		}

		// 转换输出模态
		if len(meta.Capability.OutputModal) > 0 {
			outputModal := make([]string, 0, len(meta.Capability.OutputModal))
			for _, modal := range meta.Capability.OutputModal {
				outputModal = append(outputModal, string(modal))
			}
			capability.OutputModal = outputModal
		}

		capability.InputTokens = ptr.Of(int32(meta.Capability.InputTokens))
		capability.OutputTokens = ptr.Of(int32(meta.Capability.OutputTokens))

		apiMeta.Capability = capability
	}

	// 转换连接配置
	if meta.ConnConfig != nil {
		connConfig := &oceanmodelmgr.ConnConfig{}

		// 这里需要根据实际的 chatmodel.Config 结构来转换
		// 暂时先创建一个空的配置对象
		apiMeta.ConnConfig = connConfig
	} else {
		// 如果没有连接配置，创建一个默认的空配置
		apiMeta.ConnConfig = &oceanmodelmgr.ConnConfig{}
	}

	return apiMeta, nil
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
