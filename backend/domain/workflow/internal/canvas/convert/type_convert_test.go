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

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

func TestCanvasBlockInputToTypeInfo_ObjectSchemaMap(t *testing.T) {
	b := &vo.BlockInput{
		Type: vo.VariableTypeObject,
		Schema: map[string]any{
			"foo": map[string]any{
				"type": vo.VariableTypeString,
			},
			"bar": map[string]any{
				"type": vo.VariableTypeInteger,
			},
		},
		Value: &vo.BlockInputValue{
			Type: vo.BlockInputValueTypeRef,
		},
	}

	tInfo, err := CanvasBlockInputToTypeInfo(b)
	require.NoError(t, err)
	require.NotNil(t, tInfo)

	assert.Equal(t, vo.DataTypeObject, tInfo.Type)
	require.Len(t, tInfo.Properties, 2)
	assert.Equal(t, vo.DataTypeString, tInfo.Properties["foo"].Type)
	assert.Equal(t, vo.DataTypeInteger, tInfo.Properties["bar"].Type)
}

func TestCanvasBlockInputToTypeInfo_ObjectSchemaWrappedMap(t *testing.T) {
	b := &vo.BlockInput{
		Type: vo.VariableTypeObject,
		Schema: map[string]any{
			"type": vo.VariableTypeObject,
			"schema": []any{
				map[string]any{
					"name": "foo",
					"type": vo.VariableTypeString,
				},
			},
		},
		Value: &vo.BlockInputValue{
			Type: vo.BlockInputValueTypeRef,
		},
	}

	tInfo, err := CanvasBlockInputToTypeInfo(b)
	require.NoError(t, err)
	require.NotNil(t, tInfo)

	assert.Equal(t, vo.DataTypeObject, tInfo.Type)
	require.Len(t, tInfo.Properties, 1)
	assert.Equal(t, vo.DataTypeString, tInfo.Properties["foo"].Type)
}

func TestCanvasBlockInputToFieldInfo_ObjectRefWithMapSchema(t *testing.T) {
	b := &vo.BlockInput{
		Type: vo.VariableTypeObject,
		Schema: map[string]any{
			"foo": map[string]any{
				"input": map[string]any{
					"type": vo.VariableTypeString,
					"value": map[string]any{
						"type":    vo.BlockInputValueTypeLiteral,
						"content": "abc",
					},
				},
			},
		},
		Value: &vo.BlockInputValue{
			Type: vo.BlockInputValueTypeObjectRef,
		},
	}

	sources, err := CanvasBlockInputToFieldInfo(b, einoCompose.FieldPath{"root"}, nil)
	require.NoError(t, err)
	require.Len(t, sources, 1)

	assert.Equal(t, einoCompose.FieldPath{"root", "foo"}, sources[0].Path)
	assert.Equal(t, "abc", sources[0].Source.Val)
}

func TestVariableToNamedTypeInfo_ObjectSchemaMap(t *testing.T) {
	v := &vo.Variable{
		Name: "obj",
		Type: vo.VariableTypeObject,
		Schema: map[string]any{
			"foo": map[string]any{
				"type": vo.VariableTypeString,
			},
		},
	}

	nInfo, err := VariableToNamedTypeInfo(v)
	require.NoError(t, err)
	require.NotNil(t, nInfo)
	require.Len(t, nInfo.Properties, 1)

	assert.Equal(t, "foo", nInfo.Properties[0].Name)
	assert.Equal(t, vo.DataTypeString, nInfo.Properties[0].Type)
}

func TestCanvasBlockInputToFieldInfo_ListFileMetaInvalidFilenameType(t *testing.T) {
	b := &vo.BlockInput{
		Type: vo.VariableTypeList,
		Schema: map[string]any{
			"type":       vo.VariableTypeString,
			"assistType": vo.AssistTypeImage,
		},
		Value: &vo.BlockInputValue{
			Type:    vo.BlockInputValueTypeLiteral,
			Content: []any{"a"},
			RawMeta: map[string]any{
				"fileName": []any{1},
			},
		},
	}

	_, err := CanvasBlockInputToFieldInfo(b, einoCompose.FieldPath{"files"}, nil)
	require.Error(t, err)
	require.ErrorContains(t, err, "invalid filename type")
}
