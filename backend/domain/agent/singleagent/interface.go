package singleagent

import (
	"context"
)

type CreateAgentRequest struct {
	Name      string
	Desc      string
	AvatarURI string
}

type CreateAgentResponse struct {
	AgentID string
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

type ChatRequest struct {
	AgentID string
}

type ChatResponse struct {
}

type SingleAgent interface {
	Create(ctx context.Context, req *CreateAgentRequest) (resp *CreateAgentResponse, err error)
	Update(ctx context.Context, req *UpdateAgentRequest) (resp *UpdateAgentResponse, err error)
	Delete(ctx context.Context, req *DeleteAgentRequest) (resp *DeleteAgentResponse, err error)
	Duplicate(ctx context.Context, req *DuplicateAgentRequest) (resp *DuplicateAgentResponse, err error)

	Execute(ctx context.Context, req *ChatRequest) (resp *ChatResponse, err error)
}
