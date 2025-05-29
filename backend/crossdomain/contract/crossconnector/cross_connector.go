package crossconnector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
)

type EntityConnector = entity.Connector

type Connector interface {
	List(ctx context.Context) ([]*EntityConnector, error)
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*EntityConnector, error)
	GetByID(ctx context.Context, id int64) (*EntityConnector, error)
}

var defaultSVC Connector

func DefaultSVC() Connector {
	return defaultSVC
}

func SetDefaultSVC(c Connector) {
	defaultSVC = c
}
