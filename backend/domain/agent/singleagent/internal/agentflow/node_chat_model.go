package agentflow

import (
	"context"
	"fmt"

	einoModel "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	agentModel "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

type config struct {
	modelFactory chatmodel.Factory
	modelManager crossdomain.ModelMgr
	modelInfo    *agentModel.ModelInfo
	bindTools    []*schema.ToolInfo
}

func newChatModel(ctx context.Context, conf *config) (einoModel.ChatModel, error) {
	if conf.modelManager == nil || conf.modelInfo == nil {
		return nil, fmt.Errorf("expect ModelMgr and ModelInfo for NewChatModel")
	}

	modelInfo := conf.modelInfo

	models, err := conf.modelManager.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelInfo.ModelID},
	})
	if err != nil {
		return nil, fmt.Errorf("MGetModelByID failed, err=%w", err)
	}

	if len(models) == 0 {
		return nil, fmt.Errorf("chatModel not found, modelID=%v, modelName=%v", modelInfo.ModelID, modelInfo.ModelName)
	}

	modelDetail := models[0]

	// create chat model by ChatModelFactory
	_ = modelDetail
	return nil, nil
}
