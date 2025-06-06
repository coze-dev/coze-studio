package agentflow

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func newReplyCallback(_ context.Context, executeID string) (clb callbacks.Handler,
	sr *schema.StreamReader[*entity.AgentEvent], sw *schema.StreamWriter[*entity.AgentEvent],
) {
	sr, sw = schema.Pipe[*entity.AgentEvent](10)

	rcc := &replyChunkCallback{
		sw:        sw,
		executeID: executeID,
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
	sw        *schema.StreamWriter[*entity.AgentEvent]
	executeID string
}

func (r *replyChunkCallback) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	logs.CtxInfof(ctx, "info-OnError, info=%v, err=%v", conv.DebugJsonToStr(info), err)

	switch info.Component {
	case compose.ComponentOfGraph:
		if interruptInfo, ok := compose.ExtractInterruptInfo(err); ok {
			if info.Name != "" {
				return ctx
			}
			interruptData := convInterruptInfo(ctx, interruptInfo)
			interruptData.InterruptID = r.executeID

			toolMessageEvent := &entity.AgentEvent{
				EventType: singleagent.EventTypeOfToolsMessage,
				ToolsMessage: []*schema.Message{
					{
						Role:       schema.Tool,
						Content:    "directly streaming reply",
						ToolCallID: interruptData.ToolCallID,
					},
				},
			}
			r.sw.Send(toolMessageEvent, nil)

			interruptEvent := &entity.AgentEvent{
				EventType: singleagent.EventTypeOfInterrupt,
				Interrupt: interruptData,
			}
			r.sw.Send(interruptEvent, nil)

		} else {
			r.sw.Send(nil, fmt.Errorf("node execute failed, component=%v, name=%v, err=%w",
				info.Component, info.Name, err))
		}

	}

	return ctx
}

func (r *replyChunkCallback) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	logs.CtxInfof(ctx, "info-OnStart, info=%v, input=%v", conv.DebugJsonToStr(info), conv.DebugJsonToStr(input))

	switch info.Component {
	case compose.ComponentOfToolsNode:
		ae := &entity.AgentEvent{
			EventType: singleagent.EventTypeOfFuncCall,
			FuncCall:  convToolsNodeCallbackInput(input),
		}
		r.sw.Send(ae, nil)
	}

	return ctx
}

func (r *replyChunkCallback) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	logs.CtxInfof(ctx, "info-OnEnd, info=%v, output=%v", conv.DebugJsonToStr(info), conv.DebugJsonToStr(output))
	switch info.Name {
	case keyOfKnowledgeRetriever:
		knowledgeEvent := &entity.AgentEvent{
			EventType: singleagent.EventTypeOfKnowledge,
			Knowledge: retriever.ConvCallbackOutput(output).Docs,
		}

		if knowledgeEvent.Knowledge != nil {
			r.sw.Send(knowledgeEvent, nil)
		}
	case keyOfToolsPreRetriever:
		result := convToolsPreRetrieverCallbackInput(output)

		if len(result) > 0 {
			for _, item := range result {
				var event *entity.AgentEvent
				if item.Role == schema.Tool {
					event = &entity.AgentEvent{
						EventType:    singleagent.EventTypeOfToolsMessage,
						ToolsMessage: []*schema.Message{item},
					}
				} else {
					event = &entity.AgentEvent{
						EventType: singleagent.EventTypeOfFuncCall,
						FuncCall:  item,
					}
				}
				r.sw.Send(event, nil)
			}
		}

	case keyOfSuggestParser:
		sg := convSuggestionNodeCallbackOutput(output)

		if len(sg) > 0 {
			for _, item := range sg {
				suggestionEvent := &entity.AgentEvent{
					EventType: singleagent.EventTypeOfSuggest,
					Suggest:   item,
				}
				r.sw.Send(suggestionEvent, nil)
			}
		}

	default:
		return ctx
	}

	return ctx
}

func (r *replyChunkCallback) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[callbacks.CallbackOutput],
) context.Context {
	logs.CtxInfof(ctx, "info-OnEndWithStreamOutput, info=%v, output=%v", conv.DebugJsonToStr(info), conv.DebugJsonToStr(output))
	switch info.Component {
	case compose.ComponentOfGraph, components.ComponentOfChatModel:
		if info.Name != keyOfReActAgent && info.Name != keyOfLLM {
			output.Close()
			return ctx
		}
		sr := schema.StreamReaderWithConvert(output, func(t callbacks.CallbackOutput) (*schema.Message, error) {
			cbOut := model.ConvCallbackOutput(t)
			return cbOut.Message, nil
		})

		r.sw.Send(&entity.AgentEvent{
			EventType:   singleagent.EventTypeOfFinalAnswer,
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
			EventType:    singleagent.EventTypeOfToolsMessage,
			ToolsMessage: toolsMessage,
		}, nil)
		return ctx
	default:
		return ctx
	}
}

func convInterruptInfo(ctx context.Context, interruptInfo *compose.InterruptInfo) *singleagent.InterruptInfo {
	var output *compose.InterruptInfo
	output = interruptInfo.SubGraphs[keyOfReActAgent]
	var extra any

	for i := range output.RerunNodesExtra {
		extra = output.RerunNodesExtra[i]
		break
	}
	toolsNodeExtra, err := extra.(*compose.ToolsInterruptAndRerunExtra)
	logs.CtxInfof(ctx, "toolsNodeExtra=%v, err=%v", toolsNodeExtra, err)

	var toolCallID string
	for _, toolCall := range toolsNodeExtra.ToolCalls {
		toolCallID = toolCall.ID
		break
	}

	resumeData := make(map[string]*crossworkflow.ToolInterruptEvent)
	for k, v := range toolsNodeExtra.RerunExtraMap {
		resumeData[k] = v.(*crossworkflow.ToolInterruptEvent)
	}

	interrupt := &singleagent.InterruptInfo{
		AllToolInterruptData: resumeData,
		ToolCallID:           toolCallID,
	}
	return interrupt
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

func convToolsPreRetrieverCallbackInput(output callbacks.CallbackOutput) []*schema.Message {
	switch t := output.(type) {
	case []*schema.Message:
		return t
	default:
		return nil
	}
}

func convSuggestionNodeCallbackOutput(output callbacks.CallbackInput) []*schema.Message {
	var sg []*schema.Message

	switch so := output.(type) {
	case *schema.Message:
		if so.Content != "" {
			var suggestions []string

			err := json.Unmarshal([]byte(so.Content), &suggestions)

			if err == nil && len(suggestions) > 0 {
				for _, suggestion := range suggestions {
					sm := &schema.Message{
						Role:         so.Role,
						Content:      suggestion,
						ResponseMeta: so.ResponseMeta,
					}
					sg = append(sg, sm)
				}
			}
		}
	default:
		return sg
	}

	return sg
}
