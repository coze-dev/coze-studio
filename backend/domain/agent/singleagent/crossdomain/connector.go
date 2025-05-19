package crossdomain

import (
	"context"
)

type ConnectorEntity struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	URI  string `json:"uri"`
	URL  string `json:"url"`
	Desc string `json:"description"`
}

type Connector interface {
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*ConnectorEntity, error)
}
