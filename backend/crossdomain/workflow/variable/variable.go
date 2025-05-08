package variable

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type varStore struct {
	variableChannel project_memory.VariableChannel
	vs              variables.Variables
}

func NewVariableHandler(vs variables.Variables) *variable.Handler {
	return &variable.Handler{
		UserVarStore:               newUserVarStore(vs),
		AppVarStore:                newAppVarStore(vs),
		SystemVarStore:             newSystemVarStore(vs),
		ParentIntermediateVarStore: nil,
	}
}

func newUserVarStore(vs variables.Variables) variable.Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_Custom,
		vs:              vs,
	}
}

func newAppVarStore(vs variables.Variables) variable.Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_APP,
		vs:              vs,
	}
}

func newSystemVarStore(vs variables.Variables) variable.Store {
	return &varStore{
		variableChannel: project_memory.VariableChannel_System,
		vs:              vs,
	}
}

func (v *varStore) Init(ctx context.Context) {
}

func (v *varStore) Get(ctx context.Context, path compose.FieldPath) (any, error) {
	meta := &entity.UserVariableMeta{
		BizType:      int32(project_memory.VariableConnector_Project),
		BizID:        "", // project id
		Version:      "", // project version
		ConnectorUID: "", // user id  ?
		ConnectorID:  consts.CozeConnectorID,
	}
	if len(path) == 0 {
		return nil, errors.New("field path is required")
	}
	key := path[0]
	kvItems, err := v.vs.GetVariableInstance(ctx, meta, []string{key}, project_memory.VariableChannelPtr(v.variableChannel))
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
		result := make([]interface{}, 0)
		err = sonic.Unmarshal([]byte(value), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsObjectType() {
		result := make(map[string]any)
		err = sonic.Unmarshal([]byte(value), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsStringType() {
		return value, nil
	}

	if varSchema.IsBooleanType() {
		result, err := strconv.ParseBool(value)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsNumberType() {
		result, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	if varSchema.IsIntegerType() {
		result, err := strconv.ParseInt(value, 64, 10)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	return value, nil
}

func (v *varStore) Set(ctx context.Context, path compose.FieldPath, value any) (err error) {
	meta := &entity.UserVariableMeta{
		BizType:      int32(project_memory.VariableConnector_Project),
		BizID:        "", // project id
		Version:      "", // project version
		ConnectorUID: "", // user id  ?
		ConnectorID:  consts.CozeConnectorID,
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

	_, err = v.vs.SetVariableInstance(ctx, meta, kvItems)
	if err != nil {
		return err
	}

	return nil
}

type variablesMetaGetter struct {
	vs variables.Variables
}

func NewVariablesMetaGetter() variable.VariablesMetaGetter {
	return &variablesMetaGetter{}
}

func (v variablesMetaGetter) GetProjectVariablesMeta(ctx context.Context, projectID, version string) ([]*variable.VarMeta, error) {
	varsMeta, err := v.vs.GetProjectVariablesMeta(ctx, projectID, version)
	if err != nil {
		return nil, err
	}
	metas := make([]*variable.VarMeta, 0, len(varsMeta.Variables))

	for _, vm := range varsMeta.Variables {
		varSchema, err := vm.GetSchema(ctx)
		if err != nil {
			return nil, err
		}

		varMeta := &variable.VarMeta{
			Name: vm.Keyword,
		}

		var typeInfo *variable.VarTypeInfo
		if varSchema.IsBooleanType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeBoolean,
			}
		}
		if varSchema.IsStringType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeString,
			}
		}
		if varSchema.IsNumberType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeFloat,
			}
		}
		if varSchema.IsIntegerType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeInteger,
			}
		}
		// array and object only focuses on the first layer of type validation
		if varSchema.IsArrayType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeArray,
			}
		}
		if varSchema.IsObjectType() {
			typeInfo = &variable.VarTypeInfo{
				Type: variable.VarTypeObject,
			}
		}
		if typeInfo != nil {
			varMeta.TypeInfo = *typeInfo
			metas = append(metas, varMeta)
		}
	}

	return metas, nil
}
