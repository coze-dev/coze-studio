package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

type Knowledge interface {
	MGetKnowledge(ctx context.Context, ids []int64) ([]*entity.Knowledge, error)
	Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) ([]*knowledge.RetrieveSlice, error)
}
