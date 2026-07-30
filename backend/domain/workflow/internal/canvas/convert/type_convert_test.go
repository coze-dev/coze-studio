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

package convert

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

func TestCanvasVariableToTypeInfo_ObjectSchemaTypeAssertion(t *testing.T) {
	t.Run("schema is []any - should succeed", func(t *testing.T) {
		v := &vo.Variable{
			Type: vo.VariableTypeObject,
			Schema: []any{
				map[string]any{
					"name": "field1",
					"type": vo.VariableTypeString,
				},
			},
		}
		tInfo, err := CanvasVariableToTypeInfo(v)
		assert.NoError(t, err)
		assert.Equal(t, vo.DataTypeObject, tInfo.Type)
		assert.NotNil(t, tInfo.Properties)
	})

	t.Run("schema is map[string]any - should return error instead of panic", func(t *testing.T) {
		v := &vo.Variable{
			Type:   vo.VariableTypeObject,
			Schema: map[string]any{"key": "value"}, // Invalid schema type
		}

		tInfo, err := CanvasVariableToTypeInfo(v)
		assert.Error(t, err)
		assert.Nil(t, tInfo)
		assert.Contains(t, err.Error(), "object schema must be []any")
	})

	t.Run("schema is nil - should succeed", func(t *testing.T) {
		v := &vo.Variable{
			Type:   vo.VariableTypeObject,
			Schema: nil,
		}
		tInfo, err := CanvasVariableToTypeInfo(v)
		assert.NoError(t, err)
		assert.Equal(t, vo.DataTypeObject, tInfo.Type)
	})

	t.Run("schema is string - should return error", func(t *testing.T) {
		v := &vo.Variable{
			Type:   vo.VariableTypeObject,
			Schema: "invalid",
		}
		tInfo, err := CanvasVariableToTypeInfo(v)
		assert.Error(t, err)
		assert.Nil(t, tInfo)
	})
}

func TestCanvasBlockInputToTypeInfo_ObjectSchemaTypeAssertion(t *testing.T) {
	t.Run("schema is []any - should succeed", func(t *testing.T) {
		b := &vo.BlockInput{
			Type: vo.VariableTypeObject,
			Value: &vo.BlockInputValue{
				Type: vo.BlockInputValueTypeRef,
			},
			Schema: []any{
				map[string]any{
					"name": "field1",
					"type": vo.VariableTypeString,
				},
			},
		}
		tInfo, err := CanvasBlockInputToTypeInfo(b)
		assert.NoError(t, err)
		assert.Equal(t, vo.DataTypeObject, tInfo.Type)
	})

	t.Run("schema is map[string]any - should return error instead of panic", func(t *testing.T) {
		b := &vo.BlockInput{
			Type: vo.VariableTypeObject,
			Value: &vo.BlockInputValue{
				Type: vo.BlockInputValueTypeRef,
			},
			Schema: map[string]any{"key": "value"}, // Invalid schema type
		}

		tInfo, err := CanvasBlockInputToTypeInfo(b)
		assert.Error(t, err)
		assert.Nil(t, tInfo)
		assert.Contains(t, err.Error(), "object schema must be []any")
	})
}

func TestVariableToNamedTypeInfo_ObjectSchemaTypeAssertion(t *testing.T) {
	t.Run("schema is []any - should succeed", func(t *testing.T) {
		v := &vo.Variable{
			Name: "testVar",
			Type: vo.VariableTypeObject,
			Schema: []any{
				map[string]any{
					"name": "field1",
					"type": vo.VariableTypeString,
				},
			},
		}
		nInfo, err := VariableToNamedTypeInfo(v)
		assert.NoError(t, err)
		assert.Equal(t, vo.DataTypeObject, nInfo.Type)
		assert.Equal(t, "testVar", nInfo.Name)
	})

	t.Run("schema is map[string]any - should return error instead of panic", func(t *testing.T) {
		v := &vo.Variable{
			Name:   "testVar",
			Type:   vo.VariableTypeObject,
			Schema: map[string]any{"key": "value"}, // Invalid schema type
		}

		nInfo, err := VariableToNamedTypeInfo(v)
		assert.Error(t, err)
		assert.Nil(t, nInfo)
		assert.Contains(t, err.Error(), "object schema must be []any")
	})
}

func TestBlockInputToNamedTypeInfo_ObjectSchemaTypeAssertion(t *testing.T) {
	t.Run("schema is []any - should succeed", func(t *testing.T) {
		b := &vo.BlockInput{
			Type: vo.VariableTypeObject,
			Value: &vo.BlockInputValue{
				Type: vo.BlockInputValueTypeRef,
			},
			Schema: []any{
				map[string]any{
					"name": "field1",
					"type": vo.VariableTypeString,
				},
			},
		}
		nInfo, err := BlockInputToNamedTypeInfo("testField", b)
		assert.NoError(t, err)
		assert.Equal(t, vo.DataTypeObject, nInfo.Type)
		assert.Equal(t, "testField", nInfo.Name)
	})

	t.Run("schema is map[string]any - should return error instead of panic", func(t *testing.T) {
		b := &vo.BlockInput{
			Type: vo.VariableTypeObject,
			Value: &vo.BlockInputValue{
				Type: vo.BlockInputValueTypeRef,
			},
			Schema: map[string]any{"key": "value"}, // Invalid schema type
		}

		nInfo, err := BlockInputToNamedTypeInfo("testField", b)
		assert.Error(t, err)
		assert.Nil(t, nInfo)
		assert.Contains(t, err.Error(), "object schema must be []any")
	})
}