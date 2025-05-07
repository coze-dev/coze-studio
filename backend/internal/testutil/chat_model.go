package testutil

import (
	"context"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
)

type UTChatModel struct {
	InvokeResultProvider func() (*schema.Message, error)
	StreamResultProvider func() (*schema.StreamReader[*schema.Message], error)
}

func (q *UTChatModel) Generate(ctx context.Context, in []*schema.Message, _ ...model.Option) (*schema.Message, error) {
	ctx = callbacks.EnsureRunInfo(ctx, "ut_chat_model", components.ComponentOfChatModel)
	ctx = callbacks.OnStart(ctx, in)
	msg, err := q.InvokeResultProvider()
	if err != nil {
		callbacks.OnError(ctx, err)
		return nil, err
	}

	callbackOut := &model.CallbackOutput{
		Message: msg,
	}

	if msg.ResponseMeta != nil {
		callbackOut.TokenUsage = (*model.TokenUsage)(msg.ResponseMeta.Usage)
	}

	_ = callbacks.OnEnd(ctx, callbackOut)
	return msg, nil
}

func (q *UTChatModel) Stream(ctx context.Context, in []*schema.Message, _ ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	ctx = callbacks.OnStart(ctx, in)
	outS, err := q.StreamResultProvider()
	if err != nil {
		callbacks.OnError(ctx, err)
		return nil, err
	}

	callbackStream := schema.StreamReaderWithConvert(outS, func(t *schema.Message) (*model.CallbackOutput, error) {
		callbackOut := &model.CallbackOutput{
			Message: t,
		}

		if t.ResponseMeta != nil {
			callbackOut.TokenUsage = (*model.TokenUsage)(t.ResponseMeta.Usage)
		}

		return callbackOut, nil
	})
	_, s := callbacks.OnEndWithStreamOutput(ctx, callbackStream)
	return schema.StreamReaderWithConvert(s, func(t *model.CallbackOutput) (*schema.Message, error) {
		return t.Message, nil
	}), nil
}

func (q *UTChatModel) IsCallbacksEnabled() bool {
	return true
}
