package chatmodel

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

//go:generate  mockgen -destination ../../../internal/mock/infra/contract/chatmodel/chat_model_mock.go --package mock -source chat_model.go
type ChatModel = model.ChatModel

type Factory interface {
	CreateChatModel(ctx context.Context, protocol Protocol, config *Config) (ChatModel, error)
	SupportProtocol(protocol Protocol) bool
}
