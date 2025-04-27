package agent

import (
	"context"
	"encoding/json"
	"errors"
	"io"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	entity2 "code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

func (c *singleAgentImpl) StreamExecute(ctx context.Context, ch chan *entity2.AgentRespEvent, historyMsg []*msgEntity.Message, query *msgEntity.Message) error {

	singleAgentStreamExecReq := c.buildReq2SingleAgentStreamExecute(historyMsg, query)

	components := &singleagent.Components{
		DB:    c.DB,
		IDGen: c.IDGen,
	}

	streamEvent, err := singleagent.NewService(components).StreamExecute(ctx, singleAgentStreamExecReq)

	if err != nil {
		return err
	}

	// pull stream to chan
	go func() {
		defer streamEvent.Close()
		err = c.pull(ctx, ch, streamEvent)
		if err != nil {
			logs.CtxErrorf(ctx, "pull err: %v", err)
		}
	}()

	return err
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
		if msgOne.ModelContent == nil {
			continue
		}
		var message *schema.Message
		err := json.Unmarshal([]byte(*msgOne.ModelContent), &message)

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

func (c *singleAgentImpl) pull(ctx context.Context, ch chan *entity2.AgentRespEvent, events *schema.StreamReader[*entity.AgentEvent]) (err error) {
	ctx, cancel := context.WithCancel(ctx)

	defer func() {
		close(ch)
		cancel()
	}()
	for {
		var resp *entity.AgentEvent
		if resp, err = events.Recv(); err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}
			return err
		} else {
			respChunk := &entity2.AgentRespEvent{
				EventType:    entity2.MessageType(resp.EventType),
				FinalAnswer:  resp.FinalAnswer,
				ToolsMessage: resp.ToolsMessage,
				FuncCall:     resp.FuncCall,
				Knowledge:    resp.Knowledge,
				//Suggest: resp.Suggest,
			}
			ch <- respChunk
		}
	}
}
