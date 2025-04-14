package model

import (
	"context"

	model2 "github.com/cloudwego/eino/components/model"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	chatmodel2 "code.byted.org/flow/opencoze/backend/infra/impl/chatmodel"
)

type ManagerImpl struct {
	modelMgr modelmgr.Manager
	factory  chatmodel.Factory
}

var managerImplSingleton *ManagerImpl = &ManagerImpl{
	factory: chatmodel2.NewDefaultFactory(nil),
}

func GetManagerImpl() *ManagerImpl {
	return managerImplSingleton
}

func (m *ManagerImpl) GetModel(ctx context.Context, params *model.LLMParams) (model2.ChatModel, error) {
	//TODO implement me
	panic("implement me")
}
