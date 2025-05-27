package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
)

type KnowledgeService interface {
	DeleteKnowledge(ctx context.Context, request *knowledge.DeleteKnowledgeRequest) error
}
