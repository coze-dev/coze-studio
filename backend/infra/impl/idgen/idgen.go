package idgen

import (
	"context"
	"math/rand"

	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func New() (idgen.IDGenerator, error) {
	// 初始化代码。
	return &idGenImpl{}, nil
}

type idGenImpl struct{}

func (i *idGenImpl) GenID(ctx context.Context) (int64, error) {
	// TODO: Implement me
	return rand.Int63(), nil
}
