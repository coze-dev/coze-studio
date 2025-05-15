package testutil

import (
	"context"
	"fmt"
	"runtime/debug"
	"sync"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
)

type UTChatModel struct {
	InvokeResultProvider func(index int) (*schema.Message, error)
	StreamResultProvider func(index int) (*schema.StreamReader[*schema.Message], error)
	Index                int
	ModelType            string
	mu                   sync.Mutex
}

func (q *UTChatModel) Generate(ctx context.Context, in []*schema.Message, _ ...model.Option) (*schema.Message, error) {
	ctx = callbacks.EnsureRunInfo(ctx, "ut_chat_model", components.ComponentOfChatModel)
	ctx = callbacks.OnStart(ctx, in)
	defer func() {
		q.mu.Lock()
		q.Index++
		q.mu.Unlock()
	}()
	defer func() {
		if panicErr := recover(); panicErr != nil {
			callbacks.OnError(ctx, fmt.Errorf("model: %s, panic: %v, stack: %s", q.ModelType, panicErr, string(debug.Stack())))
		}
	}()
	msg, err := q.InvokeResultProvider(q.Index)
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
	ctx = callbacks.EnsureRunInfo(ctx, "ut_chat_model", components.ComponentOfChatModel)
	ctx = callbacks.OnStart(ctx, in)
	defer func() {
		q.mu.Lock()
		q.Index++
		q.mu.Unlock()
	}()
	defer func() {
		if panicErr := recover(); panicErr != nil {
			callbacks.OnError(ctx, fmt.Errorf("model: %s, panic: %v, stack: %s", q.ModelType, panicErr, string(debug.Stack())))
		}
	}()
	outS, err := q.StreamResultProvider(q.Index)
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

func (q *UTChatModel) WithTools(tools []*schema.ToolInfo) (model.ToolCallingChatModel, error) {
	return q, nil
}

func (q *UTChatModel) IsCallbacksEnabled() bool {
	return true
}
