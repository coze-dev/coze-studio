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
	UserVarStore   Store
	SystemVarStore Store
	AppVarStore    Store
}

func (v *Handler) Get(ctx context.Context, t Type, path compose.FieldPath) (any, error) {
	switch t {

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

	return ctx
}

//go:generate mockgen -destination varmock/var_mock.go --package mockvar -source variable.go
type Store interface {
	Init(ctx context.Context)
	Get(ctx context.Context, path compose.FieldPath) (any, error)
	Set(ctx context.Context, path compose.FieldPath, value any) error
}

type VarType string

const (
	VarTypeString  VarType = "string"
	VarTypeInteger VarType = "integer"
	VarTypeFloat   VarType = "float"
	VarTypeBoolean VarType = "boolean"
	VarTypeObject  VarType = "object"
	VarTypeArray   VarType = "array"
)

type VarTypeInfo struct {
	Type         VarType
	ElemTypeInfo *VarTypeInfo
	Properties   map[string]*VarTypeInfo
}

type VarMeta struct {
	Name     string
	TypeInfo VarTypeInfo
}

var variablesMetaGetterImpl VariablesMetaGetter

func GetVariablesMetaGetter() VariablesMetaGetter {
	return variablesMetaGetterImpl
}

func SetVariablesMetaGetter(v VariablesMetaGetter) {
	variablesMetaGetterImpl = v
}

type VariablesMetaGetter interface {
	GetProjectVariablesMeta(ctx context.Context, projectID, version string) ([]*VarMeta, error)
}
