package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/knowledge_mock.go --package mock -source knowledge.go
type Knowledge interface {
	ListKnowledge(ctx context.Context, request *knowledge.ListKnowledgeRequest) (response *knowledge.ListKnowledgeResponse, err error)
	Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveResponse, error)
}
