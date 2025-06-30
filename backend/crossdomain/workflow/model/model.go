package model

import (
	"context"
	"fmt"

	model2 "github.com/cloudwego/eino/components/model"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	chatmodel2 "code.byted.org/flow/opencoze/backend/infra/impl/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type ModelManager struct {
	modelMgr modelmgr.Manager
	factory  chatmodel.Factory
}

func NewModelManager(m modelmgr.Manager, f chatmodel.Factory) *ModelManager {
	if f == nil {
		f = chatmodel2.NewDefaultFactory()
	}
	return &ModelManager{
		modelMgr: m,
		factory:  f,
	}
}

func (m *ModelManager) GetModel(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *crossmodelmgr.Model, error) {
	modelID := params.ModelType
	models, err := crossmodelmgr.DefaultSVC().MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelID},
	})
	if err != nil {
		return nil, nil, err
	}
	var config *chatmodel.Config
	var protocol chatmodel.Protocol
	var mdl *crossmodelmgr.Model
	for i := range models {
		md := models[i]
		if md.ID == modelID {
			protocol = md.Meta.Protocol
			config = md.Meta.ConnConfig
			mdl = md
			break
		}
	}

	if config == nil {
		return nil, nil, fmt.Errorf("model type %v ,not found config ", modelID)
	}

	if len(protocol) == 0 {
		return nil, nil, fmt.Errorf("model type %v ,not found protocol ", modelID)
	}

	if params.TopP != nil {
		config.TopP = ptr.Of(float32(ptr.From(params.TopP)))
	}

	if params.TopK != nil {
		config.TopK = params.TopK
	}

	if params.Temperature != nil {
		config.Temperature = ptr.Of(float32(ptr.From(params.Temperature)))
	}

	config.MaxTokens = ptr.Of(params.MaxTokens)

	// Whether you need to use a pointer
	config.FrequencyPenalty = ptr.Of(float32(params.FrequencyPenalty))
	config.PresencePenalty = ptr.Of(float32(params.PresencePenalty))

	cm, err := m.factory.CreateChatModel(ctx, protocol, config)
	if err != nil {
		return nil, nil, err
	}

	return cm, mdl, nil
}
