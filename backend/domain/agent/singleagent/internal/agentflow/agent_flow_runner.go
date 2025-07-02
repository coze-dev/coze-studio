package agentflow

import (
	"context"
	"errors"
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
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

	containWfTool bool
	modelInfo     *crossmodelmgr.Model
}

func (r *AgentRunner) StreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentEvent], err error,
) {
	executeID := uuid.New()

	hdl, sr, sw := newReplyCallback(ctx, executeID.String())

	go func() {
		defer func() {
			if pe := recover(); pe != nil {
				logs.CtxErrorf(ctx, "[AgentRunner] StreamExecute recover, err: %v", pe)

				sw.Send(nil, errors.New("internal server error"))
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
				composeOpts = append(composeOpts, compose.WithCheckPointID(req.ResumeInfo.InterruptID))

				if resumeInfo.InterruptType != singleagent.InterruptEventType_OauthPlugin {
					opts := crossworkflow.DefaultSVC().WithResumeToolWorkflow(resumeInfo.AllWfInterruptData[resumeInfo.ToolCallID], req.Input.Content, resumeInfo.AllWfInterruptData)
					composeOpts = append(composeOpts, opts)
				}

			} else {
				composeOpts = append(composeOpts, compose.WithCheckPointID(executeID.String()))
			}
		}
		if r.containWfTool {
			cfReq := crossworkflow.ExecuteConfig{
				AgentID:      &req.Identity.AgentID,
				ConnectorUID: req.UserID,
				ConnectorID:  req.Identity.ConnectorID,
				BizType:      crossworkflow.BizTypeAgent,
			}
			if req.Identity.IsDraft {
				cfReq.Mode = crossworkflow.ExecuteModeDebug
			} else {
				cfReq.Mode = crossworkflow.ExecuteModeRelease
			}
			wfConfig := crossworkflow.DefaultSVC().WithExecuteConfig(cfReq)
			composeOpts = append(composeOpts, wfConfig)
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
		case schema.ChatMessagePartTypeAudioURL:
			if !slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalAudio) {
				input.Content = input.Content + ": " + v.FileURL.URL
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeVideoURL:
			if !slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalVideo) {
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
