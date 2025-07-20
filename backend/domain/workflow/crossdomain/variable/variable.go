/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package variable

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
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

func (v *Handler) Get(ctx context.Context, t vo.GlobalVarType, path compose.FieldPath, opts ...OptionFn) (any, error) {
	switch t {
	case vo.GlobalUser:
		return v.UserVarStore.Get(ctx, path, opts...)
	case vo.GlobalSystem:
		return v.SystemVarStore.Get(ctx, path, opts...)
	case vo.GlobalAPP:
		return v.AppVarStore.Get(ctx, path, opts...)
	default:
		return nil, fmt.Errorf("unknown variable type: %v", t)
	}
}

func (v *Handler) Set(ctx context.Context, t vo.GlobalVarType, path compose.FieldPath, value any, opts ...OptionFn) error {
	switch t {
	case vo.GlobalUser:
		return v.UserVarStore.Set(ctx, path, value, opts...)
	case vo.GlobalSystem:
		return v.SystemVarStore.Set(ctx, path, value, opts...)
	case vo.GlobalAPP:
		return v.AppVarStore.Set(ctx, path, value, opts...)
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

type StoreInfo struct {
	AppID        *int64
	AgentID      *int64
	ConnectorID  int64
	ConnectorUID string
}

type StoreConfig struct {
	StoreInfo StoreInfo
}

type OptionFn func(*StoreConfig)

func WithStoreInfo(info StoreInfo) OptionFn {
	return func(option *StoreConfig) {
		option.StoreInfo = info
	}
}

//go:generate mockgen -destination varmock/var_mock.go --package mockvar -source variable.go
type Store interface {
	Init(ctx context.Context)
	Get(ctx context.Context, path compose.FieldPath, opts ...OptionFn) (any, error)
	Set(ctx context.Context, path compose.FieldPath, value any, opts ...OptionFn) error
}

var variablesMetaGetterImpl VariablesMetaGetter

func GetVariablesMetaGetter() VariablesMetaGetter {
	return variablesMetaGetterImpl
}

func SetVariablesMetaGetter(v VariablesMetaGetter) {
	variablesMetaGetterImpl = v
}

type VariablesMetaGetter interface {
	GetAppVariablesMeta(ctx context.Context, id, version string) (m map[string]*vo.TypeInfo, err error)
	GetAgentVariablesMeta(ctx context.Context, id int64, version string) (m map[string]*vo.TypeInfo, err error)
}
