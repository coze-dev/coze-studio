package agent

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type singleAgentImpl struct {
	streamEvent *schema.StreamReader[*entity.AgentEvent]
	IDGen       idgen.IDGenerator
	DB          *gorm.DB
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewSingleAgent(c *Components) crossdomain.SingleAgent {
	return &singleAgentImpl{
		DB:    c.DB,
		IDGen: c.IDGen,
	}
}

func (c *singleAgentImpl) StreamExecute(ctx context.Context, historyMsg []*msgEntity.Message, query *msgEntity.Message) (*schema.StreamReader[*entity.AgentEvent], error) {
	singleAgentStreamExecReq := c.buildReq2SingleAgentStreamExecute(historyMsg, query)

	components := &singleagent.Components{
		// DB:    c.DB,
		// IDGen: c.IDGen,
	}

	// TODO: FIXME 改成注入
	streamEvent, err := singleagent.NewService(components).StreamExecute(ctx, singleAgentStreamExecReq)

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
