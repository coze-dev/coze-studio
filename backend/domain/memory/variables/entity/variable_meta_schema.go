package entity

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

const (
	variableMetaSchemaTypeObject = "object"
	variableMetaSchemaTypeArray  = "array"
)

// TODO: remove me later
// {"name":"app_var_arr","enable":true,"description":"121222","type":"list","readonly":false,"schema":{"type":"integer"}}
type VariableMetaSchema struct {
	Type        string          `json:"type,omitempty"`
	Name        string          `json:"name,omitempty"`
	Description string          `json:"description,omitempty"`
	Readonly    string          `json:"readonly,omitempty"`
	Enable      bool            `json:"enable,omitempty"`
	Schema      json.RawMessage `json:"schema,omitempty"`
}

func newVariableMetaSchema(schema []byte) (*VariableMetaSchema, error) {
	schemaObj := &VariableMetaSchema{}
	err := json.Unmarshal([]byte(schema), schemaObj)
	if err != nil {
		return nil, errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	return schemaObj, nil
}

func (v *VariableMetaSchema) IsArrayType() bool {
	return v.Type == variableMetaSchemaTypeArray
}

// GetArrayType  e.g. schema = {"type":"int"}
func (v *VariableMetaSchema) GetArrayType(schema []byte) (string, error) {
	schemaObj, err := newVariableMetaSchema(schema)
	if err != nil {
		return "", errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	if schemaObj.Type == "" {
		return "", errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("array type not found in %s", schema)))
	}

	return schemaObj.Type, nil
}

func (v *VariableMetaSchema) IsObjectType() bool {
	return v.Type == variableMetaSchemaTypeObject
}

// GetObjetProperties  e.g. schema = [{"name":"app_var_12_sdd","enable":true,"description":"s22","type":"string","readonly":false,"schema":""}]
func (v *VariableMetaSchema) GetObjectProperties(schema []byte) (map[string]*VariableMetaSchema, error) {
	schemas := make([]*VariableMetaSchema, 0)
	err := json.Unmarshal(schema, &schemas)
	if err != nil {
		return nil, errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema array content json invalid"))
	}

	properties := make(map[string]*VariableMetaSchema)
	for _, schemaObj := range schemas {
		properties[schemaObj.Name] = schemaObj
	}

	return properties, nil
}

func (v *VariableMetaSchema) check(ctx context.Context) error {
	return v.checkAppVariableSchema(ctx, v, "")
}

func (v *VariableMetaSchema) checkAppVariableSchema(ctx context.Context, schemaObj *VariableMetaSchema, schema string) (err error) {
	if len(schema) == 0 && schemaObj == nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema is nil"))
	}

	if schemaObj == nil {
		schemaObj, err = newVariableMetaSchema([]byte(schema))
		if err != nil {
			return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
		}
	}

	if !schemaObj.nameValidate() {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("name(%s) is invalid", schemaObj.Name)))
	}

	if schemaObj.Type == variableMetaSchemaTypeObject {
		return v.checkSchemaObj(ctx, schemaObj.Schema)
	} else if schemaObj.Type == variableMetaSchemaTypeArray {
		_, err := v.GetArrayType(schemaObj.Schema)
		if err != nil {
			return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
		}
	}

	return nil
}

func (v *VariableMetaSchema) checkSchemaObj(ctx context.Context, schema []byte) error {
	properties, err := v.GetObjectProperties(schema)
	if err != nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	for _, schemaObj := range properties {
		if err := v.checkAppVariableSchema(ctx, schemaObj, ""); err != nil {
			return err
		}
	}

	return nil
}

func (s *VariableMetaSchema) nameValidate() bool {
	identifier := s.Name

	reservedWords := map[string]bool{
		"true": true, "false": true, "and": true, "AND": true,
		"or": true, "OR": true, "not": true, "NOT": true,
		"null": true, "nil": true, "If": true, "Switch": true,
	}

	if reservedWords[identifier] {
		return false
	}

	// 检查是否符合后面的部分正则规则
	pattern := `^[a-zA-Z_][a-zA-Z_$0-9]*$`
	match, _ := regexp.MatchString(pattern, identifier)

	return match
}
