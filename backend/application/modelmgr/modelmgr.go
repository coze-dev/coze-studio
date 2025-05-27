package modelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
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
		Scenario: ptr.Of(modelEntity.ScenarioSingleReactAgent),
		Limit:    modelMaxLimit,
		Cursor:   nil,
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
		func(param *modelEntity.Parameter) *developer_api.ModelParameter {
			return parameterDo2To(param)
		},
	)

	return &developer_api.Model{
		Name:             model.Name,
		ModelName:        mm.Name,
		ModelIcon:        mm.IconURL,
		ModelType:        model.ID,
		ModelClass:       mm.Protocol.TOModelClass(),
		ModelClassName:   mm.Protocol.TOModelClass().String(),
		ModelInputPrice:  0,
		ModelOutputPrice: 0,
		ModelQuota:       &developer_api.ModelQuota{},
		ModelDesc: []*developer_api.ModelDescGroup{
			{
				GroupName: "Description",
				Desc:      []string{model.Description},
			},
		},
		ModelParams: mps,
		ModelAbility: &developer_api.ModelAbility{
			FunctionCall:       ptr.Of(mm.Capability.FunctionCall),
			ImageUnderstanding: ptr.Of(supportImageModal(mm.Capability.InputModal)),
			VideoUnderstanding: ptr.Of(supportVideoModal(mm.Capability.InputModal)),
		},
	}, nil
}

func ModelProtocol2ModelClass(protocol chatmodel.Protocol, modelName string) developer_api.ModelClass {
	switch protocol {
	case chatmodel.ProtocolArk:
		return developer_api.ModelClass_SEED
	case chatmodel.ProtocolOpenAI:
		return developer_api.ModelClass_GPT
	case chatmodel.ProtocolDeepseek:
		return developer_api.ModelClass_DeekSeek
	case chatmodel.ProtocolClaude:
		return developer_api.ModelClass_Claude
	case chatmodel.ProtocolGemini:
		return developer_api.ModelClass_Gemini
	case chatmodel.ProtocolOllama:
		return developer_api.ModelClass_Llama
	case chatmodel.ProtocolQwen:
		return developer_api.ModelClass_QWen
	case chatmodel.ProtocolErnie:
		return developer_api.ModelClass_Ernie
	default:
		return developer_api.ModelClass_Other
	}
}

func supportImageModal(ms []modelEntity.Modal) bool {
	for _, m := range ms {
		if m == modelEntity.ModalImage {
			return true
		}
	}
	return false
}

func supportVideoModal(ms []modelEntity.Modal) bool {
	for _, m := range ms {
		if m == modelEntity.ModalVideo {
			return true
		}
	}
	return false
}

func parameterDo2To(param *modelEntity.Parameter) *developer_api.ModelParameter {
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
	if val, ok := param.DefaultVal[modelEntity.DefaultTypeDefault]; ok {
		custom = val
	}

	if val, ok := param.DefaultVal[modelEntity.DefaultTypeCreative]; ok {
		creative = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelEntity.DefaultTypeBalance]; ok {
		balance = ptr.Of(val)
	}

	if val, ok := param.DefaultVal[modelEntity.DefaultTypePrecise]; ok {
		precise = ptr.Of(val)
	}

	return &developer_api.ModelParameter{
		Name:  string(param.Name),
		Label: param.Label,
		Desc:  param.Desc,
		Type: func() developer_api.ModelParamType {
			switch param.Type {
			case modelEntity.ValueTypeBoolean:
				return developer_api.ModelParamType_Boolean
			case modelEntity.ValueTypeInt:
				return developer_api.ModelParamType_Int
			case modelEntity.ValueTypeFloat:
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
				case modelEntity.WidgetSlider:
					return 1
				case modelEntity.WidgetRadioButtons:
					return 2
				default:
					return 0
				}
			}(),
			Label: param.Style.Label,
		},
	}
}
