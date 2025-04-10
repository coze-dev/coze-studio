package loop

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/variables"
)

type Break struct {
	parentIntermediateStore variables.VariableStore
}

func NewBreak(_ context.Context, store variables.VariableStore) (*Break, error) {
	return &Break{
		parentIntermediateStore: store,
	}, nil
}

const BreakKey = "$break"

func (b *Break) DoBreak(ctx context.Context) error {
	return b.parentIntermediateStore.Set(ctx, compose.FieldPath{BreakKey}, true)
}
