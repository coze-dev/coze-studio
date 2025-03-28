package agentflow

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type AgentState struct {
}

type AgentRequest struct {
	Input   *schema.Message
	History []*schema.Message

	Variables map[string]string
}

type AgentResponse struct {
	Chunk *entity.AgentReply
}

type AgentRunner struct {
	runner compose.Runnable[*AgentRequest, *schema.Message]
}

func (r *AgentRunner) StreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentReply], err error) {

	hdl, sr, sw := newReplyCallback(ctx)

	go func() {
		defer func() {
			if pe := recover(); pe != nil {
				sw.Send(nil, fmt.Errorf("panic occurred in AgentFlow: %v \nstack=%s",
					string(debug.Stack())))
			}
			sw.Close()
		}()

		_, _ = r.runner.Stream(ctx, req, compose.WithCallbacks(hdl))
	}()

	return sr, nil
}
