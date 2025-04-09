package loop

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type Break struct{}

const BreakKey = "break_"

func (b *Break) Invoke(_ context.Context, in map[string]any) (map[string]any, error) {
	return map[string]any{
		BreakKey: true,
	}, nil
}

func (b *Break) Collect(_ context.Context, in *schema.StreamReader[map[string]any]) (map[string]any, error) {
	in.Close()
	return map[string]any{
		BreakKey: true,
	}, nil
}
