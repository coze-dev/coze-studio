package agentflow

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

func newReplyCallback(_ context.Context) (clb callbacks.Handler,
	sr *schema.StreamReader[*entity.AgentEvent], sw *schema.StreamWriter[*entity.AgentEvent]) {

	sr, sw = schema.Pipe[*entity.AgentEvent](10)

	rcc := &replyChunkCallback{
		sw: sw,
	}

	clb = callbacks.NewHandlerBuilder().
		OnStartFn(rcc.OnStart).
		OnEndFn(rcc.OnEnd).
		OnEndWithStreamOutputFn(rcc.OnEndWithStreamOutput).
		OnErrorFn(rcc.OnError).
		Build()

	return clb, sr, sw
}

type replyChunkCallback struct {
	sw *schema.StreamWriter[*entity.AgentEvent]
}

func (r *replyChunkCallback) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {

	r.sw.Send(nil, fmt.Errorf("node execute failed, component=%v, name=%v, err=%w",
		info.Component, info.Name, err))

	return ctx
}

func (r *replyChunkCallback) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {

	switch info.Component {
	case compose.ComponentOfToolsNode:
		ae := &entity.AgentEvent{
			EventType: entity.EventTypeOfFuncCall,
			FuncCall:  convToolsNodeCallbackInput(input),
		}
		r.sw.Send(ae, nil)
	}

	return ctx
}

func (r *replyChunkCallback) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {

	switch info.Name {
	case keyOfKnowledgeRetriever:
		knowledgeEvent := &entity.AgentEvent{
			EventType: entity.EventTypeOfKnowledge,
			Knowledge: retriever.ConvCallbackOutput(output).Docs,
		}
		r.sw.Send(knowledgeEvent, nil)
	default:
		return ctx
	}

	return ctx
}

func (r *replyChunkCallback) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {

	switch info.Component {
	case components.ComponentOfChatModel:
		sr := schema.StreamReaderWithConvert(output, func(t callbacks.CallbackOutput) (*schema.Message, error) {
			cbOut := model.ConvCallbackOutput(t)
			return cbOut.Message, nil
		})

		r.sw.Send(&entity.AgentEvent{
			EventType:   entity.EventTypeOfFinalAnswer,
			FinalAnswer: sr,
		}, nil)
		return ctx
	case compose.ComponentOfToolsNode:
		toolsMessage, err := concatToolsNodeOutput(ctx, output)
		if err != nil {
			r.sw.Send(nil, err)
			return ctx
		}

		r.sw.Send(&entity.AgentEvent{
			EventType:    entity.EventTypeOfToolsMessage,
			ToolsMessage: toolsMessage,
		}, nil)
		return ctx
	default:
		return ctx
	}
}

func concatToolsNodeOutput(ctx context.Context, output *schema.StreamReader[callbacks.CallbackOutput]) ([]*schema.Message, error) {
	defer output.Close()
	toolsMsgChunks := make([][]*schema.Message, 0, 5)
	for {
		cbOut, err := output.Recv()
		if errors.Is(err, io.EOF) {
			break
		}

		if err != nil {
			return nil, err
		}

		msgs := convToolsNodeCallbackOutput(cbOut)

		for _, msg := range msgs {
			if msg == nil || msg.ToolCallID == "" {
				continue
			}

			findSameMsg := false
			for i, msgChunks := range toolsMsgChunks {
				if msg.ToolCallID == msgChunks[0].ToolCallID {
					toolsMsgChunks[i] = append(toolsMsgChunks[i], msg)
					findSameMsg = true
					break
				}
			}

			if !findSameMsg {
				toolsMsgChunks = append(toolsMsgChunks, []*schema.Message{msg})
			}
		}
	}

	toolMessages := make([]*schema.Message, 0, len(toolsMsgChunks))

	for _, msgChunks := range toolsMsgChunks {
		msg, err := schema.ConcatMessages(msgChunks)
		if err != nil {
			return nil, err
		}
		toolMessages = append(toolMessages, msg)
	}

	return toolMessages, nil
}

func convToolsNodeCallbackInput(input callbacks.CallbackInput) *schema.Message {
	switch t := input.(type) {
	case *schema.Message:
		return t
	default:
		return nil
	}
}

func convToolsNodeCallbackOutput(output callbacks.CallbackOutput) []*schema.Message {
	switch t := output.(type) {
	case []*schema.Message:
		return t
	default:
		return nil
	}
}
