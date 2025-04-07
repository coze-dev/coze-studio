package agentflow

import (
	"context"
	"time"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

const (
	placeholderOfUserInput   = "_user_input"
	placeholderOfChatHistory = "_chat_history"
)

type promptVariables struct {
	Agent *entity.SingleAgent
}

func (p *promptVariables) AssemblePromptVariables(ctx context.Context, req *AgentRequest) (variables map[string]any, err error) {
	variables = make(map[string]any)

	variables[placeholderOfTime] = time.Now().Format("Monday 2006/01/02 15:04:05 -07")
	variables[placeholderOfAgentName] = p.Agent.Name

	if req.Input != nil {
		variables[placeholderOfUserInput] = []*schema.Message{req.Input}
	}

	// 处理对话历史
	if len(req.History) > 0 {
		// 将历史消息添加到变量中
		variables[placeholderOfChatHistory] = req.History
	}

	return variables, nil
}
