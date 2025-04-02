package chatmodel

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

type ChatModel = model.ChatModel

type Factory interface {
	CreateChatModel(ctx context.Context, protocol Protocol, config *Config) (ChatModel, error)
	SupportProtocol(protocol Protocol) bool
}
