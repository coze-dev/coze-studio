package conversation

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/conversation"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type CreateConversationConfig struct {
	Creator conversation.ConversationManager
}

type CreateConversation struct {
	config *CreateConversationConfig
}

func NewCreateConversation(ctx context.Context, cfg *CreateConversationConfig) (*CreateConversation, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.Creator == nil {
		return nil, errors.New("creator is required")
	}
	return &CreateConversation{
		config: cfg,
	}, nil
}

func (c *CreateConversation) Create(ctx context.Context, input map[string]any) (map[string]any, error) {
	name, ok := nodes.TakeMapValue(input, compose.FieldPath{"ConversationName"})
	if !ok {
		return nil, errors.New("input map should contains 'ConversationName' key ")
	}
	response, err := c.config.Creator.CreateConversation(ctx, &conversation.CreateConversationRequest{
		Name: name.(string),
	})
	if err != nil {
		return nil, err
	}
	return response.Result, nil

}
