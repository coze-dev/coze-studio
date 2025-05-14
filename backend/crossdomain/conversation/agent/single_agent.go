package agent

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type singleAgentImpl struct {
	streamEvent *schema.StreamReader[*entity.AgentEvent]
	domainSVC   singleagent.SingleAgent
}

func NewSingleAgent(sa singleagent.SingleAgent) crossdomain.SingleAgent {
	return &singleAgentImpl{
		domainSVC: sa,
	}
}

func (c *singleAgentImpl) StreamExecute(ctx context.Context, historyMsg []*msgEntity.Message, query *msgEntity.Message) (*schema.StreamReader[*entity.AgentEvent], error) {
	singleAgentStreamExecReq := c.buildReq2SingleAgentStreamExecute(historyMsg, query)

	streamEvent, err := c.domainSVC.StreamExecute(ctx, singleAgentStreamExecReq)

	return streamEvent, err
}

func (c *singleAgentImpl) buildReq2SingleAgentStreamExecute(historyMsg []*msgEntity.Message, input *msgEntity.Message) *entity.ExecuteRequest {
	identity := c.buildIdentity(input)

	user := c.buildUser(input)

	inputBuild := c.buildSchemaMessage([]*msgEntity.Message{input})

	history := c.buildSchemaMessage(historyMsg)
	return &entity.ExecuteRequest{
		Identity: identity,
		Input:    inputBuild[0],
		History:  history,
		User:     user,
	}
}

func (c *singleAgentImpl) buildSchemaMessage(msgs []*msgEntity.Message) []*schema.Message {
	schemaMessage := make([]*schema.Message, 0, len(msgs))

	for _, msgOne := range msgs {
		if msgOne.ModelContent == "" {
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

func (c *singleAgentImpl) buildUser(input *msgEntity.Message) *userEntity.UserIdentity {
	return &userEntity.UserIdentity{
		UserID: input.UserID,
	}
}

func (c *singleAgentImpl) buildIdentity(input *msgEntity.Message) *entity.AgentIdentity {
	return &entity.AgentIdentity{
		AgentID: input.AgentID,
	}
}
