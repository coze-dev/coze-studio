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
	variableMetaSchemaTypeObject  = "object"
	variableMetaSchemaTypeArray   = "array"
	variableMetaSchemaTypeInteger = "integer"
	variableMetaSchemaTypeString  = "string"
	variableMetaSchemaTypeBoolean = "boolean"
	variableMetaSchemaTypeNumber  = "float"
)

// TODO: remove me later
// {"name":"app_var_arr","enable":true,"description":"121222","type":"list","readonly":false,"schema":{"type":"integer"}}
type VariableMetaSchema struct {
	Type        string          `json:"type,omitempty"`
	Name        string          `json:"name,omitempty"`
	Description string          `json:"description,omitempty"`
	Readonly    bool            `json:"readonly,omitempty"`
	Enable      bool            `json:"enable,omitempty"`
	Schema      json.RawMessage `json:"schema,omitempty"`
}

func NewVariableMetaSchema(schema []byte) (*VariableMetaSchema, error) {
	schemaObj := &VariableMetaSchema{}
	err := json.Unmarshal(schema, schemaObj)
	if err != nil {
		return nil, errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("schema json invalid: %s \n json = %s", err.Error(), string(schema))))
	}

	return schemaObj, nil
}

func (v *VariableMetaSchema) IsArrayType() bool {
	return v.Type == variableMetaSchemaTypeArray
}

// GetArrayType  e.g. schema = {"type":"int"}
func (v *VariableMetaSchema) GetArrayType(schema []byte) (string, error) {
	schemaObj, err := NewVariableMetaSchema(schema)
	if err != nil {
		return "", errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	if schemaObj.Type == "" {
		return "", errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("array type not found in %s", schema)))
	}

	return schemaObj.Type, nil
}

func (v *VariableMetaSchema) IsStringType() bool {
	return v.Type == variableMetaSchemaTypeString
}

func (v *VariableMetaSchema) IsIntegerType() bool {
	return v.Type == variableMetaSchemaTypeInteger
}

func (v *VariableMetaSchema) IsBooleanType() bool {
	return v.Type == variableMetaSchemaTypeBoolean
}

func (v *VariableMetaSchema) IsNumberType() bool {
	return v.Type == variableMetaSchemaTypeNumber
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
		schemaObj, err = NewVariableMetaSchema([]byte(schema))
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

func (v *VariableMetaSchema) nameValidate() bool {
	identifier := v.Name

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
