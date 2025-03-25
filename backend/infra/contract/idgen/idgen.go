package idgen

import (
	"context"
)

type IDGenerator interface {
	GenID(ctx context.Context) (int64, error)
}
