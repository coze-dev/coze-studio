package knowledge

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

type Knowledge interface {
	QueryKnowledge(ctx context.Context, knowledgeIDs []int64) (map[int64]*entity.Knowledge, error)
	Retrieve(ctx context.Context, req *entity.RetrieveRequest) (resp *entity.RetrieveResponse, err error)
}
