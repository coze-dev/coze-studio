package variable

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

var variableHandlerSingleton *Handler

func GetVariableHandler() *Handler {
	return variableHandlerSingleton
}
func SetVariableHandler(handler *Handler) {
	variableHandlerSingleton = handler
}

type Handler struct {
	UserVarStore               Store
	SystemVarStore             Store
	AppVarStore                Store
	ParentIntermediateVarStore Store
}

func (v *Handler) Get(ctx context.Context, t Type, path compose.FieldPath) (any, error) {
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

func (v *Handler) Set(ctx context.Context, t Type, path compose.FieldPath, value any) error {
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

func (v *Handler) Init(ctx context.Context) context.Context {
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

//go:generate mockgen -destination varmock/var_mock.go --package mockvar -source variable.go
type Store interface {
	Init(ctx context.Context)
	Get(ctx context.Context, path compose.FieldPath) (any, error)
	Set(ctx context.Context, path compose.FieldPath, value any) error
}
