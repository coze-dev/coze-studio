package conversation

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/conversation"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type ClearMessageConfig struct {
	Clearer conversation.ConversationManager
}

type MessageClear struct {
	config *ClearMessageConfig
}

func NewClearMessage(ctx context.Context, cfg *ClearMessageConfig) (*MessageClear, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.Clearer == nil {
		return nil, errors.New("clearer is required")
	}

	return &MessageClear{
		config: cfg,
	}, nil
}

func (c *MessageClear) Clear(ctx context.Context, input map[string]any) (map[string]any, error) {
	name, ok := nodes.TakeMapValue(input, compose.FieldPath{"ConversationName"})
	if !ok {
		return nil, errors.New("input map should contains 'ConversationName' key ")
	}
	response, err := c.config.Clearer.ClearMessage(ctx, &conversation.ClearMessageRequest{
		Name: name.(string),
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"isSuccess": response.IsSuccess,
	}, nil
}
