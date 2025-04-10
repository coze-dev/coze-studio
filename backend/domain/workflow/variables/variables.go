package variables

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"
)

type Type string

const (
	ParentIntermediate Type = "parent_intermediate"
	GlobalUser         Type = "global_user"
	GlobalSystem       Type = "global_system"
	GlobalAPP          Type = "global_app"
)

type VariableHandler struct {
	UserVarStore               VariableStore
	SystemVarStore             VariableStore
	AppVarStore                VariableStore
	ParentIntermediateVarStore VariableStore
}

func (v *VariableHandler) Get(ctx context.Context, t Type, path compose.FieldPath) (any, error) {
	switch t {
	case ParentIntermediate:
		return v.ParentIntermediateVarStore.Get(ctx, path)
	case GlobalUser:
		return v.UserVarStore.Get(ctx, path)
	case GlobalSystem:
		return v.SystemVarStore.Get(ctx, path)
	case GlobalAPP:
		return v.AppVarStore.Get(ctx, path)
	default:
		return nil, fmt.Errorf("unknown variable type: %v", t)
	}
}

func (v *VariableHandler) Set(ctx context.Context, t Type, path compose.FieldPath, value any) error {
	switch t {
	case ParentIntermediate:
		return v.ParentIntermediateVarStore.Set(ctx, path, value)
	case GlobalUser:
		return v.UserVarStore.Set(ctx, path, value)
	case GlobalSystem:
		return v.SystemVarStore.Set(ctx, path, value)
	case GlobalAPP:
		return v.AppVarStore.Set(ctx, path, value)
	default:
		return fmt.Errorf("unknown variable type: %v", t)
	}
}

func (v *VariableHandler) Init(ctx context.Context) context.Context {
	if v.UserVarStore != nil {
		v.UserVarStore.Init(ctx)
	}

	if v.SystemVarStore != nil {
		v.SystemVarStore.Init(ctx)
	}

	if v.AppVarStore != nil {
		v.AppVarStore.Init(ctx)
	}

	if v.ParentIntermediateVarStore != nil {
		v.ParentIntermediateVarStore.Init(ctx)
	}

	return ctx
}

func GenStateFn(p, a, s, u VariableStore) compose.GenLocalState[*VariableHandler] {
	return func(ctx context.Context) *VariableHandler {
		v := &VariableHandler{
			ParentIntermediateVarStore: p,
			AppVarStore:                a,
			SystemVarStore:             s,
			UserVarStore:               u,
		}

		v.Init(ctx)

		return v
	}
}

type VariableStore interface {
	Init(ctx context.Context)
	Get(ctx context.Context, path compose.FieldPath) (any, error)
	Set(ctx context.Context, path compose.FieldPath, value any) error
}
