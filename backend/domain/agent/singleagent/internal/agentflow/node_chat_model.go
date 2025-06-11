package agentflow

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type config struct {
	modelFactory chatmodel.Factory
	modelInfo    *crossmodelmgr.Model
}

func newChatModel(ctx context.Context, conf *config) (chatmodel.ToolCallingChatModel, error) {

	if conf.modelInfo == nil {
		return nil, fmt.Errorf("model is nil")
	}
	modelDetail := conf.modelInfo
	modelMeta := modelDetail.Meta

	if !conf.modelFactory.SupportProtocol(modelMeta.Protocol) {
		return nil, errorx.New(errno.ErrAgentSupportedChatModelProtocol,
			errorx.KV("protocol", string(modelMeta.Protocol)))
	}

	cm, err := conf.modelFactory.CreateChatModel(ctx, modelDetail.Meta.Protocol, &chatmodel.Config{
		// BaseURL: modelMeta.ConnConfig.BaseURL, // TODO: ConnConfig should be exported
		Model:  modelMeta.ConnConfig.Model,
		APIKey: modelMeta.ConnConfig.APIKey,
	})
	if err != nil {
		return nil, err
	}

	return cm, nil
}

func loadModelInfo(ctx context.Context, modelID int64) (*crossmodelmgr.Model, error) {
	if modelID == 0 {
		return nil, fmt.Errorf("modelID is required")
	}

	models, err := crossmodelmgr.DefaultSVC().MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelID},
	})

	if err != nil {
		return nil, fmt.Errorf("MGetModelByID failed, err=%w", err)
	}
	if len(models) == 0 {
		return nil, fmt.Errorf("model not found, modelID=%v", modelID)
	}

	return models[0], nil
}
