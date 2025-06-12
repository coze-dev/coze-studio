package llm

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
)

type ModelWithFallback struct {
	Model         model.BaseChatModel
	FallbackModel model.BaseChatModel
	UseFallback   func(ctx context.Context) bool
}

func (m *ModelWithFallback) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	if m.UseFallback(ctx) {
		return m.FallbackModel.Generate(ctx, input, opts...)
	}
	return m.Model.Generate(ctx, input, opts...)
}

func (m *ModelWithFallback) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	if m.UseFallback(ctx) {
		return m.FallbackModel.Stream(ctx, input, opts...)
	}
	return m.Model.Stream(ctx, input, opts...)
}

func (m *ModelWithFallback) WithTools(tools []*schema.ToolInfo) (model.ToolCallingChatModel, error) {
	toolModel, ok := m.Model.(model.ToolCallingChatModel)
	if !ok {
		return nil, errors.New("requires a ToolCallingChatModel to use with tools")
	}

	fallbackToolModel, ok := m.FallbackModel.(model.ToolCallingChatModel)
	if !ok {
		return nil, errors.New("requires a ToolCallingChatModel to use with tools")
	}

	var err error
	toolModel, err = toolModel.WithTools(tools)
	if err != nil {
		return nil, err
	}

	fallbackToolModel, err = fallbackToolModel.WithTools(tools)
	if err != nil {
		return nil, err
	}

	return &ModelWithFallback{
		Model:         toolModel,
		FallbackModel: fallbackToolModel,
		UseFallback:   m.UseFallback,
	}, nil
}
