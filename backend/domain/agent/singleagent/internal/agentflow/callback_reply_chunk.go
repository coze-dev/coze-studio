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
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

func newReplyCallback(_ context.Context) (clb callbacks.Handler,
	sr *schema.StreamReader[*entity.AgentReply], sw *schema.StreamWriter[*entity.AgentReply]) {

	sr, sw = schema.Pipe[*entity.AgentReply](10)

	rcc := &replyChunkCallback{
		sw:      sw,
		replyID: 0,
	}

	clb = callbacks.NewHandlerBuilder().
		OnEndFn(rcc.OnEnd).
		OnEndWithStreamOutputFn(rcc.OnEndWithStreamOutput).
		OnErrorFn(rcc.OnError).
		Build()

	return clb, sr, sw
}

type replyChunkCallback struct {
	sw      *schema.StreamWriter[*entity.AgentReply]
	replyID int
}

func (r *replyChunkCallback) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	defer func() {
		r.replyID++
	}()

	r.sw.Send(nil, fmt.Errorf("node execute failed, component=%v, name=%v, err=%w",
		info.Component, info.Name, err))

	return ctx
}

func (r *replyChunkCallback) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {

	defer func() {
		r.replyID++
	}()

	var reply *entity.AgentReply
	var err error
	switch info.Component {
	case components.ComponentOfRetriever:
		reply, err = convertRetrieverOutput(ctx, r.replyID, retriever.ConvCallbackOutput(output))
	case components.ComponentOfTool:
		reply, err = convertToolOutput(ctx, r.replyID, info.Name, tool.ConvCallbackOutput(output))
	default:
		return ctx
	}

	r.sw.Send(reply, err)

	return ctx
}

func (r *replyChunkCallback) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {

	defer output.Close()
	defer func() {
		r.replyID++
	}()

	replyID := r.replyID

	switch info.Component {
	case components.ComponentOfChatModel:
	default:
		return ctx
	}

	for {
		msg, err := output.Recv()
		if errors.Is(err, io.EOF) {
			break
		}

		if err != nil {
			r.sw.Send(nil, err)
			break
		}

		reply, err := convertChatModelOutput(ctx, replyID, model.ConvCallbackOutput(msg))
		if err != nil {
			r.sw.Send(nil, err)
			break
		}

		r.sw.Send(reply, nil)
	}

	return ctx
}

func convertRetrieverOutput(ctx context.Context, replyID int, o *retriever.CallbackOutput) (*entity.AgentReply, error) {
	return &entity.AgentReply{
		ReplyType: entity.ReplyTypeOfKnowledge,
		ReplyID:   replyID,
		Knowledge: o.Docs,
	}, nil
}

func convertChatModelOutput(ctx context.Context, replyID int, o *model.CallbackOutput) (*entity.AgentReply, error) {
	return &entity.AgentReply{
		ReplyType:       entity.ReplyTypeOfChatModelOutput,
		ReplyID:         replyID,
		ChatModelOutput: o.Message,
	}, nil
}

func convertToolOutput(ctx context.Context, replyID int, toolName string, o *tool.CallbackOutput) (*entity.AgentReply, error) {
	return &entity.AgentReply{
		ReplyType: entity.ReplyTypeOfToolOutput,
		ReplyID:   replyID,
		ToolOutput: &entity.ToolOutput{
			ToolName: toolName,
			Result:   o.Response,
		},
	}, nil
}
