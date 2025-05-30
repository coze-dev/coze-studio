package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
)

type ConnectorService interface {
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*entity.Connector, error)
}
