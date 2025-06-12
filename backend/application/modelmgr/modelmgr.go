package modelmgr

import (
	"context"

	modelmgrEntity "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type ModelmgrApplicationService struct {
	DomainSVC modelmgr.Manager
}

var ModelmgrApplicationSVC = &ModelmgrApplicationService{}

func (m *ModelmgrApplicationService) GetModelList(ctx context.Context, req *developer_api.GetTypeListRequest) (
	resp *developer_api.GetTypeListResponse, err error,
) {
	// 一般不太可能同时配置这么多模型
	const modelMaxLimit = 300

	modelResp, err := m.DomainSVC.ListModel(ctx, &modelmgr.ListModelRequest{
		Limit:  modelMaxLimit,
		Cursor: nil,
	})
	if err != nil {
		return nil, err
	}

	modelList, err := slices.TransformWithErrorCheck(modelResp.ModelList, func(m *modelEntity.Model) (*developer_api.Model, error) {
		logs.CtxInfof(ctx, "ChatModel DefaultParameters: %v", m.DefaultParameters)
		return modelDo2To(m)
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

func modelDo2To(model *modelEntity.Model) (*developer_api.Model, error) {
	mm := model.Meta

	mps := slices.Transform(model.DefaultParameters,
		func(param *modelmgrEntity.Parameter) *developer_api.ModelParameter {
			return parameterDo2To(param)
		},
	)

	return &developer_api.Model{
		Name:             model.Name,
		ModelType:        model.ID,
		ModelClass:       mm.Protocol.TOModelClass(),
		ModelIcon:        mm.IconURL,
		ModelInputPrice:  0,
		ModelOutputPrice: 0,
		ModelQuota: &developer_api.ModelQuota{
			TokenLimit: int32(mm.Capability.MaxTokens),
			TokenResp:  int32(mm.Capability.OutputTokens),
			//TokenSystem:       0,
			//TokenUserIn:       0,
			//TokenToolsIn:      0,
			//TokenToolsOut:     0,
			//TokenData:         0,
			//TokenHistory:      0,
			//TokenCutSwitch:    false,
			PriceIn:           0,
			PriceOut:          0,
			SystemPromptLimit: nil,
		},
		ModelName:      mm.Name,
		ModelClassName: mm.Protocol.TOModelClass().String(),
		IsOffline:      mm.Status != modelmgrEntity.StatusInUse,
		ModelParams:    mps,
		ModelDesc: []*developer_api.ModelDescGroup{
			{
				GroupName: "Description",
				Desc:      []string{model.Description},
			},
		},
		FuncConfig:     nil,
		EndpointName:   nil,
		ModelTagList:   nil,
		IsUpRequired:   nil,
		ModelBriefDesc: mm.Description,
		ModelSeries: &developer_api.ModelSeriesInfo{ // TODO: 替换为真实配置
			SeriesName: "热门模型",
		},
		ModelStatusDetails: nil,
		ModelAbility: &developer_api.ModelAbility{
			FunctionCall:       ptr.Of(mm.Capability.FunctionCall),
			ImageUnderstanding: ptr.Of(supportImageModal(mm.Capability.InputModal)),
			VideoUnderstanding: ptr.Of(supportVideoModal(mm.Capability.InputModal)),
		},
	}, nil
}

func supportImageModal(ms []modelmgrEntity.Modal) bool {
	for _, m := range ms {
		if m == modelmgrEntity.ModalImage {
			return true
		}
	}
	return false
}

func supportVideoModal(ms []modelmgrEntity.Modal) bool {
	for _, m := range ms {
		if m == modelmgrEntity.ModalVideo {
			return true
		}
	}
	return false
}

func parameterDo2To(param *modelmgrEntity.Parameter) *developer_api.ModelParameter {
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
	if val, ok := param.DefaultVal[modelmgrEntity.DefaultTypeDefault]; ok {
		custom = val
	}

	if val, ok := param.DefaultVal[modelmgrEntity.DefaultTypeCreative]; ok {
		creative = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelmgrEntity.DefaultTypeBalance]; ok {
		balance = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelmgrEntity.DefaultTypePrecise]; ok {
		precise = ptr.Of(val)
	}

	return &developer_api.ModelParameter{
		Name:  string(param.Name),
		Label: param.Label,
		Desc:  param.Desc,
		Type: func() developer_api.ModelParamType {
			switch param.Type {
			case modelmgrEntity.ValueTypeBoolean:
				return developer_api.ModelParamType_Boolean
			case modelmgrEntity.ValueTypeInt:
				return developer_api.ModelParamType_Int
			case modelmgrEntity.ValueTypeFloat:
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
				case modelmgrEntity.WidgetSlider:
					return 1
				case modelmgrEntity.WidgetRadioButtons:
					return 2
				default:
					return 0
				}
			}(),
			Label: param.Style.Label,
		},
	}
}
