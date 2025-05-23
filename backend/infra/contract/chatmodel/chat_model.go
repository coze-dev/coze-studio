package chatmodel

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

//go:generate  mockgen -destination ../../../internal/mock/infra/contract/chatmodel/base_model_mock.go -package mock -source ${GOPATH}/src/github.com/cloudwego/eino/components/model/interface.go BaseChatModel
type BaseChatModel = model.BaseChatModel

//go:generate  mockgen -destination ../../../internal/mock/infra/contract/chatmodel/toolcalling_model_mock.go -package mock -source ${GOPATH}/src/github.com/cloudwego/eino/components/model/interface.go ToolCallingChatModel
type ToolCallingChatModel = model.ToolCallingChatModel

//go:generate  mockgen -destination ../../../internal/mock/infra/contract/chatmodel/chat_model_factory_mock.go -package mock -source chat_model.go Factory
type Factory interface {
	CreateChatModel(ctx context.Context, protocol Protocol, config *Config) (ToolCallingChatModel, error)
	SupportProtocol(protocol Protocol) bool
}
