package idgen

import (
	"context"
)

//go:generate mockgen -destination ../../../internal/mock/infra/contract/idgen/idgen_mock.go --package mock -source idgen.go
type IDGenerator interface {
	GenID(ctx context.Context) (int64, error)
	GenMultiIDs(ctx context.Context, counts int) ([]int64, error) // suggest batch size <= 200
}
