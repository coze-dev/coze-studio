package loop

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
)

type Break struct {
	parentIntermediateStore variable.Store
}

func NewBreak(_ context.Context, store variable.Store) (*Break, error) {
	return &Break{
		parentIntermediateStore: store,
	}, nil
}

const BreakKey = "$break"

func (b *Break) DoBreak(ctx context.Context, _ map[string]any) (map[string]any, error) {
	err := b.parentIntermediateStore.Set(ctx, compose.FieldPath{BreakKey}, true)
	if err != nil {
		return nil, err
	}
	return map[string]any{}, nil
}
