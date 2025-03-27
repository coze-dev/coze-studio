package intentrecognition

import (
	"context"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
)

type ChatModelRecognize struct {
	cm model.ChatModel
}

func NewChatModelRecognize(ctx context.Context, cm model.ChatModel) (*ChatModelRecognize, error) {
	return &ChatModelRecognize{
		cm: cm,
	}, nil
}

func (c *ChatModelRecognize) Recognize(ctx context.Context, messages ...*schema.Message) (*schema.Message, error) {
	var err error

	response, err := c.cm.Generate(ctx, messages)

	if err != nil {
		return nil, err
	}

	return response, nil

}
