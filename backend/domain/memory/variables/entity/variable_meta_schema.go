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

package entity

import (
	"context"
	"encoding/json"
	"regexp"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	variableMetaSchemaTypeObject  = "object"
	variableMetaSchemaTypeArray   = "list"
	variableMetaSchemaTypeInteger = "integer"
	variableMetaSchemaTypeString  = "string"
	variableMetaSchemaTypeBoolean = "boolean"
	variableMetaSchemaTypeNumber  = "float"
)

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
		return nil, errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "schema json invalid: %s \n json = %s", err.Error(), string(schema)))
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
		return "", errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "NewVariableMetaSchema failed, %v", err.Error()))
	}

	if schemaObj.Type == "" {
		return "", errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "array type not found in %s", schema))
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

// GetObjectProperties  e.g. schema = [{"name":"app_var_12_sdd","enable":true,"description":"s22","type":"string","readonly":false,"schema":""}]
func (v *VariableMetaSchema) GetObjectProperties(schema []byte) (map[string]*VariableMetaSchema, error) {
	schemas := make([]*VariableMetaSchema, 0)
	err := json.Unmarshal(schema, &schemas)
	if err != nil {
		return nil, errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KV("msg", "schema array content json invalid"))
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
		return errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KV("msg", "schema is nil"))
	}

	if schemaObj == nil {
		schemaObj, err = NewVariableMetaSchema([]byte(schema))
		if err != nil {
			return errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "checkAppVariableSchema failed , %v", err.Error()))
		}
	}

	if !schemaObj.nameValidate() {
		return errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "name(%s) is invalid", schemaObj.Name))
	}

	if schemaObj.Type == variableMetaSchemaTypeObject {
		return v.checkSchemaObj(ctx, schemaObj.Schema)
	} else if schemaObj.Type == variableMetaSchemaTypeArray {
		_, err := v.GetArrayType(schemaObj.Schema)
		if err != nil {
			return errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "GetArrayType failed : %v", err.Error()))
		}
	}

	return nil
}

func (v *VariableMetaSchema) checkSchemaObj(ctx context.Context, schema []byte) error {
	properties, err := v.GetObjectProperties(schema)
	if err != nil {
		return errorx.New(errno.ErrMemorySchemeInvalidCode, errorx.KVf("msg", "GetObjectProperties failed : %v", err.Error()))
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

	// Check if some of the following regular rules are met
	pattern := `^[a-zA-Z_][a-zA-Z_$0-9]*$`
	match, _ := regexp.MatchString(pattern, identifier)

	return match
}
