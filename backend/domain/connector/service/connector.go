package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
)

type Connector interface {
	List(ctx context.Context) ([]*entity.Connector, error)
	GetByIDs(ctx context.Context, ids []int64) ([]*entity.Connector, error)
}
