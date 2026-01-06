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
	"errors"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/variables"
	variablesModel "github.com/coze-dev/coze-studio/backend/crossdomain/variables/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type varStore struct {
	variableChannel project_memory.VariableChannel
}

func NewVariableHandler() *Handler {
	return &Handler{
		UserVarStore:   newUserVarStore(),
		AppVarStore:    newAppVarStore(),
		SystemVarStore: newSystemVarStore(),
	}
}

func newUserVarStore() Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_Custom,
	}
}

func newAppVarStore() Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_APP,
	}
}

func newSystemVarStore() Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_System,
	}
}

func (v *varStore) Init(ctx context.Context) {
}

func (v *varStore) Get(ctx context.Context, path compose.FieldPath, opts ...OptionFn) (any, error) {
	opt := &StoreConfig{}
	for _, o := range opts {
		o(opt)
	}

	var (
		bizID   string
		bizType project_memory.VariableConnector
	)

	if opt.StoreInfo.AppID != nil {
		bizID = strconv.FormatInt(*opt.StoreInfo.AppID, 10)
		bizType = project_memory.VariableConnector_Project
	} else if opt.StoreInfo.AgentID != nil {
		bizID = strconv.FormatInt(*opt.StoreInfo.AgentID, 10)
		bizType = project_memory.VariableConnector_Bot
	} else {
		return nil, fmt.Errorf("there must be one of the App ID or Agent ID")
	}

	meta := &variablesModel.UserVariableMeta{
		BizType:      bizType,
		BizID:        bizID,
		ConnectorID:  opt.StoreInfo.ConnectorID,
		ConnectorUID: opt.StoreInfo.ConnectorUID,
	}
	if len(path) == 0 {
		return nil, errors.New("field path is required")
	}
	key := path[0]
	kvItems, err := crossvariables.DefaultSVC().GetVariableChannelInstance(ctx, meta, []string{key}, project_memory.VariableChannelPtr(v.variableChannel))
	if err != nil {
		return nil, err
	}

	if len(kvItems) == 0 {
		return nil, fmt.Errorf("variable %s not exists", key)
	}

	value := kvItems[0].GetValue()

	schema := kvItems[0].GetSchema()

	varSchema, err := entity.NewVariableMetaSchema([]byte(schema))
	if err != nil {
		return nil, err
	}

	if varSchema.IsArrayType() {
		if value == "" {
			return nil, nil
		}
		result := make([]interface{}, 0)
		err = sonic.Unmarshal([]byte(value), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsObjectType() {
		if value == "" {
			return nil, nil
		}
		result := make(map[string]any)
		err = sonic.Unmarshal([]byte(value), &result)
		if err != nil {
			return nil, err
		}
		if len(path) > 1 {
			if val, ok := takeMapValue(result, path[1:]); ok {
				return val, nil
			}
			return nil, nil
		}
		return result, nil
	}

	if varSchema.IsStringType() {
		return value, nil
	}

	if varSchema.IsBooleanType() {
		if value == "" {
			return false, nil
		}
		result, err := strconv.ParseBool(value)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsNumberType() {
		if value == "" {
			return 0, nil
		}
		result, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsIntegerType() {
		if value == "" {
			return 0, nil
		}
		result, err := strconv.ParseInt(value, 64, 10)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	return value, nil
}

func (v *varStore) Set(ctx context.Context, path compose.FieldPath, value any, opts ...OptionFn) (err error) {
	opt := &StoreConfig{}
	for _, o := range opts {
		o(opt)
	}

	var (
		bizID   string
		bizType project_memory.VariableConnector
	)

	if opt.StoreInfo.AppID != nil {
		bizID = strconv.FormatInt(*opt.StoreInfo.AppID, 10)
		bizType = project_memory.VariableConnector_Project
	} else if opt.StoreInfo.AgentID != nil {
		bizID = strconv.FormatInt(*opt.StoreInfo.AgentID, 10)
		bizType = project_memory.VariableConnector_Bot
	} else {
		return fmt.Errorf("there must be one of the App ID or Agent ID")
	}

	meta := &variablesModel.UserVariableMeta{
		BizType:      bizType,
		BizID:        bizID,
		ConnectorID:  opt.StoreInfo.ConnectorID,
		ConnectorUID: opt.StoreInfo.ConnectorUID,
	}

	if len(path) == 0 {
		return errors.New("field path is required")
	}

	key := path[0]
	kvItems := make([]*kvmemory.KVItem, 0, 1)

	valueString := ""
	if _, ok := value.(string); ok {
		valueString = value.(string)
	} else {
		valueString, err = sonic.MarshalString(value)
		if err != nil {
			return err
		}
	}

	isSystem := ternary.IFElse[bool](v.variableChannel == project_memory.VariableChannel_System, true, false)
	kvItems = append(kvItems, &kvmemory.KVItem{
		Keyword:  key,
		Value:    valueString,
		IsSystem: isSystem,
	})

	_, err = crossvariables.DefaultSVC().SetVariableInstance(ctx, meta, kvItems)
	if err != nil {
		return err
	}

	return nil
}

type variablesMetaGetter struct {
}

func NewVariablesMetaGetter() VariablesMetaGetter {
	return &variablesMetaGetter{}
}

func (v variablesMetaGetter) GetAppVariablesMeta(ctx context.Context, id, version string) (m map[string]*vo.TypeInfo, err error) {
	var varMetas *entity.VariablesMeta
	varMetas, err = crossvariables.DefaultSVC().GetProjectVariablesMeta(ctx, id, version)
	if err != nil {
		return nil, err
	}

	m = make(map[string]*vo.TypeInfo, len(varMetas.Variables))
	for _, v := range varMetas.Variables {
		varSchema, err := v.GetSchema(ctx)
		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrVariablesAPIFail, err)
		}

		t, err := varMeta2TypeInfo(varSchema)
		if err != nil {
			return nil, err
		}

		m[v.Keyword] = t
	}

	return m, nil
}

func (v variablesMetaGetter) GetAgentVariablesMeta(ctx context.Context, id int64, version string) (m map[string]*vo.TypeInfo, err error) {
	var varMetas *entity.VariablesMeta
	varMetas, err = crossvariables.DefaultSVC().GetAgentVariableMeta(ctx, id, version)
	if err != nil {
		return nil, err
	}

	m = make(map[string]*vo.TypeInfo, len(varMetas.Variables))
	for _, v := range varMetas.Variables {
		varSchema, err := v.GetSchema(ctx)
		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrVariablesAPIFail, err)
		}

		t, err := varMeta2TypeInfo(varSchema)
		if err != nil {
			return nil, err
		}

		m[v.Keyword] = t
	}

	return m, nil
}

func varMeta2TypeInfo(v *entity.VariableMetaSchema) (*vo.TypeInfo, error) {
	if v.IsBooleanType() {
		return &vo.TypeInfo{
			Type: vo.DataTypeBoolean,
		}, nil
	}
	if v.IsStringType() {
		return &vo.TypeInfo{
			Type: vo.DataTypeString,
		}, nil
	}
	if v.IsNumberType() {
		return &vo.TypeInfo{
			Type: vo.DataTypeNumber,
		}, nil
	}
	if v.IsIntegerType() {
		return &vo.TypeInfo{
			Type: vo.DataTypeInteger,
		}, nil
	}
	if v.IsArrayType() {
		if len(v.Schema) == 0 {
			return nil, vo.WrapError(errno.ErrVariablesAPIFail, fmt.Errorf("array type should contain element type info"))
		}

		elemType, err := entity.NewVariableMetaSchema(v.Schema)
		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrVariablesAPIFail, err)
		}

		et, err := varMeta2TypeInfo(elemType)
		if err != nil {
			return nil, err
		}

		return &vo.TypeInfo{
			Type:         vo.DataTypeArray,
			ElemTypeInfo: et,
		}, nil
	}
	if v.IsObjectType() {
		ps, err := v.GetObjectProperties(v.Schema)
		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrVariablesAPIFail, err)
		}

		properties := make(map[string]*vo.TypeInfo, len(ps))
		for k, p := range ps {
			pt, err := varMeta2TypeInfo(p)
			if err != nil {
				return nil, err
			}
			properties[k] = pt
		}

		return &vo.TypeInfo{
			Type:       vo.DataTypeObject,
			Properties: properties,
		}, nil
	}
	return nil, vo.WrapError(errno.ErrVariablesAPIFail, fmt.Errorf("invalid variable type"))
}

func takeMapValue(m map[string]any, path []string) (any, bool) {
	if m == nil {
		return nil, false
	}

	container := m
	for _, p := range path[:len(path)-1] {
		if _, ok := container[p]; !ok {
			return nil, false
		}
		container = container[p].(map[string]any)
	}

	if v, ok := container[path[len(path)-1]]; ok {
		return v, true
	}

	return nil, false
}
