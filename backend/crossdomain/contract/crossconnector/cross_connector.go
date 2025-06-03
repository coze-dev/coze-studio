package crossconnector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
)

type Connector interface {
	List(ctx context.Context) ([]*connector.Connector, error)
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*connector.Connector, error)
	GetByID(ctx context.Context, id int64) (*connector.Connector, error)
}

var defaultSVC Connector

func DefaultSVC() Connector {
	return defaultSVC
}

func SetDefaultSVC(c Connector) {
	defaultSVC = c
}
