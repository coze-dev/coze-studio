package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/knowledge_mock.go --package mock -source knowledge.go
type Knowledge interface {
	MGetKnowledge(ctx context.Context, request *knowledge.MGetKnowledgeRequest) ([]*entity.Knowledge, int64, error)
	Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) ([]*knowledge.RetrieveSlice, error)
}
