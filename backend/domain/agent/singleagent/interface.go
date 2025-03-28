package singleagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type CreateAgentRequest struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	User *userEntity.UserIdentity
}

type CreateAgentResponse struct {
	Agent *entity.SingleAgent
}

type UpdateAgentRequest struct {
}

type UpdateAgentResponse struct {
}

type DeleteAgentRequest struct {
}

type DuplicateAgentResponse struct {
}

type DuplicateAgentRequest struct {
}

type DeleteAgentResponse struct {
}

type PublishAgentRequest struct {
}

type PublishAgentResponse struct {
}

type QueryAgentRequest struct {
	Identities []*entity.AgentIdentity

	User *userEntity.UserIdentity
}

type QueryAgentResponse struct {
	Agents []*entity.SingleAgent
}

type ExecuteRequest struct {
	Identity *entity.AgentIdentity
	User     *userEntity.UserIdentity

	Input   *schema.Message
	History []*schema.Message
}

type ExecuteResponse struct {
	Chunk *entity.AgentReply
}

type SingleAgent interface {
	Create(ctx context.Context, req *CreateAgentRequest) (resp *CreateAgentResponse, err error)
	Update(ctx context.Context, req *UpdateAgentRequest) (resp *UpdateAgentResponse, err error)
	Delete(ctx context.Context, req *DeleteAgentRequest) (resp *DeleteAgentResponse, err error)
	Duplicate(ctx context.Context, req *DuplicateAgentRequest) (resp *DuplicateAgentResponse, err error)
	Publish(ctx context.Context, req *PublishAgentRequest) (resp *PublishAgentResponse, err error)
	Query(ctx context.Context, req *QueryAgentRequest) (resp *QueryAgentResponse, err error)

	StreamExecute(ctx context.Context, req *ExecuteRequest) (resp *ExecuteResponse, err error)
}
