package agentflow

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type AgentState struct {
	Messages                 []*schema.Message
	UserInput                *schema.Message
	ReturnDirectlyToolCallID string
}

type AgentRequest struct {
	Input   *schema.Message
	History []*schema.Message

	ResumeInfo   *singleagent.InterruptInfo
	PreCallTools []*agentrun.ToolsRetriever
	Variables    map[string]string
}

type AgentRunner struct {
	runner            compose.Runnable[*AgentRequest, *schema.Message]
	requireCheckpoint bool
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
