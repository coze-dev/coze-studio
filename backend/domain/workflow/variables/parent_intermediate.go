package variables

import (
	"context"
	"fmt"
	"sync"

	"github.com/cloudwego/eino/compose"
)

type ParentIntermediateStore struct {
	mu sync.RWMutex
}

type IntermediateVarKey struct{}

func (p *ParentIntermediateStore) Init(_ context.Context) {
	return
}

func (p *ParentIntermediateStore) Get(ctx context.Context, path compose.FieldPath) (any, error) {
	defer p.mu.RUnlock()
	p.mu.RLock()

	if len(path) != 1 {
		return nil, fmt.Errorf("invalid path: %v", path)
	}

	v, ok := getIntermediateVars(ctx)[path[0]]
	if !ok {
		return nil, fmt.Errorf("variable not found: %s", path[0])
	}

	return *v, nil
}

func (p *ParentIntermediateStore) Set(ctx context.Context, path compose.FieldPath, value any) error {
	defer p.mu.Unlock()
	p.mu.Lock()

	if len(path) != 1 {
		return fmt.Errorf("invalid path: %v", path)
	}

	v, ok := getIntermediateVars(ctx)[path[0]]
	if !ok {
		return fmt.Errorf("variable not found: %s", path[0])
	}

	*v = value
	return nil
}

func InitIntermediateVars(ctx context.Context, vars map[string]*any) context.Context {
	return context.WithValue(ctx, IntermediateVarKey{}, vars)
}

func getIntermediateVars(ctx context.Context) map[string]*any {
	return ctx.Value(IntermediateVarKey{}).(map[string]*any)
}
