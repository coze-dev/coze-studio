package chatmodel

import (
	"context"

	"github.com/cloudwego/eino/schema"

	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
)

type chatModelImpl struct{}

func NewChatModel() crossdomain.ChatModel {
	return &chatModelImpl{}
}

func (c *chatModelImpl) StreamExecute(ctx context.Context) {

}

func (c *chatModelImpl) buildReq2ChatModel(ctx context.Context, msg crossdomain.Message) (*entity.ExecuteRequest, error) {

	//identity := c.buildIdentity()
	//
	//user := c.buildUser()
	//
	//input := c.buildSchemaMessage()
	//
	//history := c.buildSchemaMessage()
	//return &entity.ExecuteRequest{
	//	Identity: identity,
	//	Input:    input[0],
	//	History:  history,
	//	User:     user,
	//}, nil

	return nil, nil
}

func (c *chatModelImpl) buildSchemaMessage() []*schema.Message {
	var schemaMessage []*schema.Message
	return schemaMessage
}

func (c *chatModelImpl) buildUser() *userEntity.UserIdentity {
	return &userEntity.UserIdentity{}
}

func (c *chatModelImpl) buildIdentity() *entity.AgentIdentity {
	return &entity.AgentIdentity{}
}
