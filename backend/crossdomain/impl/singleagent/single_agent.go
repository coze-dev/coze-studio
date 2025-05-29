package agent

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	arEntity "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

var defaultSVC crossagent.SingleAgent

type impl struct {
	DomainSVC singleagent.SingleAgent
}

func InitDomainService(c singleagent.SingleAgent) crossagent.SingleAgent {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) StreamExecute(ctx context.Context, historyMsg []*msgEntity.Message, query *msgEntity.Message, agentRuntime *crossagent.AgentRuntime) (*schema.StreamReader[*entity.AgentEvent], error) {
	singleAgentStreamExecReq := c.buildReq2SingleAgentStreamExecute(historyMsg, query, agentRuntime)

	streamEvent, err := c.DomainSVC.StreamExecute(ctx, singleAgentStreamExecReq)
	logs.CtxInfof(ctx, "agent StreamExecute req:%v, streamEvent:%v, err:%v", conv.DebugJsonToStr(singleAgentStreamExecReq), streamEvent, err)
	return streamEvent, err
}

func (c *impl) buildReq2SingleAgentStreamExecute(historyMsg []*msgEntity.Message, input *msgEntity.Message, agentRuntime *crossagent.AgentRuntime) *entity.ExecuteRequest {
	identity := c.buildIdentity(input, agentRuntime)

	inputBuild := c.buildSchemaMessage([]*msgEntity.Message{input})

	history := c.buildSchemaMessage(historyMsg)
	return &entity.ExecuteRequest{
		Identity: identity,
		Input:    inputBuild[0],
		History:  history,
		UserID:   input.UserID,
		SpaceID:  agentRuntime.SpaceID,
	}
}

func (c *impl) buildSchemaMessage(msgs []*msgEntity.Message) []*schema.Message {
	schemaMessage := make([]*schema.Message, 0, len(msgs))

	for _, msgOne := range msgs {
		if msgOne.ModelContent == "" {
			continue
		}
		if msgOne.MessageType == arEntity.MessageTypeVerbose || msgOne.MessageType == arEntity.MessageTypeFlowUp {
			continue
		}
		var message *schema.Message
		err := json.Unmarshal([]byte(msgOne.ModelContent), &message)
		if err != nil {
			continue
		}
		schemaMessage = append(schemaMessage, message)
	}
	return schemaMessage
}

func (c *impl) buildIdentity(input *msgEntity.Message, agentRuntime *crossagent.AgentRuntime) *entity.AgentIdentity {
	return &entity.AgentIdentity{
		AgentID:     input.AgentID,
		Version:     agentRuntime.AgentVersion,
		IsDraft:     agentRuntime.IsDraft,
		ConnectorID: agentRuntime.ConnectorID,
	}
}

func (c *impl) GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *entity.SingleAgent, err error) {
	return c.DomainSVC.GetSingleAgent(ctx, agentID, version)
}
