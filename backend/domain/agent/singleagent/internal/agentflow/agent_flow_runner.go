package agentflow

import (
	"context"
	"fmt"
	"runtime/debug"
	"slices"

	"github.com/google/uuid"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type AgentState struct {
	Messages                 []*schema.Message
	UserInput                *schema.Message
	ReturnDirectlyToolCallID string
}

type AgentRequest struct {
	UserID  string
	Input   *schema.Message
	History []*schema.Message

	Identity *singleagent.AgentIdentity

	ResumeInfo   *singleagent.InterruptInfo
	PreCallTools []*agentrun.ToolsRetriever
	Variables    map[string]string
}

type AgentRunner struct {
	runner            compose.Runnable[*AgentRequest, *schema.Message]
	requireCheckpoint bool

	modelInfo *crossmodelmgr.Model
}

func (r *AgentRunner) StreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentEvent], err error,
) {
	executeID := uuid.New()

	hdl, sr, sw := newReplyCallback(ctx, executeID.String())

	go func() {
		defer func() {
			if pe := recover(); pe != nil {
				sw.Send(nil, fmt.Errorf("panic occurred in AgentFlow: %v \nstack=%s",
					pe, string(debug.Stack())))
			}
			sw.Close()
		}()

		var composeOpts []compose.Option
		composeOpts = append(composeOpts, compose.WithCallbacks(hdl))
		_ = compose.RegisterSerializableType[*AgentState]("agent_state")
		if r.requireCheckpoint {
			if req.ResumeInfo != nil {
				composeOpts = append(composeOpts, compose.WithCheckPointID(req.ResumeInfo.InterruptID))

				resumeInfo := req.ResumeInfo
				opts := crossworkflow.DefaultSVC().WithResumeToolWorkflow(resumeInfo.AllToolInterruptData[resumeInfo.ToolCallID], req.Input.Content, resumeInfo.AllToolInterruptData)
				composeOpts = append(composeOpts, opts)
			} else {
				composeOpts = append(composeOpts, compose.WithCheckPointID(executeID.String()))
			}
		}
		_, _ = r.runner.Stream(ctx, req, composeOpts...)
	}()

	return sr, nil
}

func (r *AgentRunner) PreHandlerReq(ctx context.Context, req *AgentRequest) *AgentRequest {
	req.Input = r.preHandlerInput(req.Input)
	req.History = r.preHandlerHistory(req.History)

	return req
}

func (r *AgentRunner) preHandlerInput(input *schema.Message) *schema.Message {
	var multiContent []schema.ChatMessagePart
	for _, v := range input.MultiContent {
		switch v.Type {
		case schema.ChatMessagePartTypeImageURL:
			if !slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalImage) {
				input.Content = input.Content + ": " + v.ImageURL.URL
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeFileURL:
			if !slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalFile) {
				input.Content = input.Content + ": " + v.FileURL.URL
			} else {
				multiContent = append(multiContent, v)
			}

		case schema.ChatMessagePartTypeText:
			break

		default:
			multiContent = append(multiContent, v)
		}
	}
	input.MultiContent = multiContent
	return input
}

func (r *AgentRunner) preHandlerHistory(history []*schema.Message) []*schema.Message {
	var hm []*schema.Message
	for _, msg := range history {
		if msg.Role == schema.User {
			msg = r.preHandlerInput(msg)
		}
		hm = append(hm, msg)
	}
	return hm
}
