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

package plugin

import (
	"testing"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/stretchr/testify/assert"
)

func TestPluginService_UnwrapArrayItemFieldsInVariable(t *testing.T) {
	s := &pluginService{}
	t.Run("unwraps a simple array item", func(t *testing.T) {
		input := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{
					Name: "[Array Item]",
					Type: vo.VariableTypeObject,
					Schema: []*vo.Variable{
						{Name: "field1", Type: vo.VariableTypeString},
						{Name: "field2", Type: vo.VariableTypeInteger},
					},
				},
			},
		}

		expected := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{Name: "field1", Type: vo.VariableTypeString},
				{Name: "field2", Type: vo.VariableTypeInteger},
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("handles nested array items", func(t *testing.T) {
		input := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{
					Name: "[Array Item]",
					Type: vo.VariableTypeObject,
					Schema: []*vo.Variable{
						{Name: "field1", Type: vo.VariableTypeString},
						{
							Name: "[Array Item]",
							Type: vo.VariableTypeObject,
							Schema: []*vo.Variable{
								{Name: "nestedField", Type: vo.VariableTypeBoolean},
							},
						},
					},
				},
			},
		}

		expected := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{Name: "field1", Type: vo.VariableTypeString},
				{Name: "nestedField", Type: vo.VariableTypeBoolean},
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("handles array item within a list", func(t *testing.T) {
		input := &vo.Variable{
			Name: "rootList",
			Type: vo.VariableTypeList,
			Schema: &vo.Variable{
				Type: vo.VariableTypeObject,
				Schema: []*vo.Variable{
					{
						Name: "[Array Item]",
						Type: vo.VariableTypeObject,
						Schema: []*vo.Variable{
							{Name: "itemField", Type: vo.VariableTypeString},
						},
					},
				},
			},
		}

		expected := &vo.Variable{
			Name: "rootList",
			Type: vo.VariableTypeList,
			Schema: &vo.Variable{
				Type: vo.VariableTypeObject,
				Schema: []*vo.Variable{
					{Name: "itemField", Type: vo.VariableTypeString},
				},
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("does nothing if no array item is present", func(t *testing.T) {
		input := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{Name: "field1", Type: vo.VariableTypeString},
				{Name: "field2", Type: vo.VariableTypeInteger},
			},
		}

		// Create a copy for comparison as the input will be modified in place.
		expected := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{Name: "field1", Type: vo.VariableTypeString},
				{Name: "field2", Type: vo.VariableTypeInteger},
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("handles primitive type array item in object", func(t *testing.T) {
		input := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{
					Name: "[Array Item]",
					Type: vo.VariableTypeString,
				},
				{
					Name: "anotherField",
					Type: vo.VariableTypeInteger,
				},
			},
		}

		expected := &vo.Variable{
			Name: "root",
			Type: vo.VariableTypeObject,
			Schema: []*vo.Variable{
				{
					Name: "",
					Type: vo.VariableTypeString,
				},
				{
					Name: "anotherField",
					Type: vo.VariableTypeInteger,
				},
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("handles list of primitives", func(t *testing.T) {
		input := &vo.Variable{
			Name: "listOfStrings",
			Type: vo.VariableTypeList,
			Schema: &vo.Variable{
				Name: "[Array Item]",
				Type: vo.VariableTypeString,
			},
		}

		expected := &vo.Variable{
			Name: "listOfStrings",
			Type: vo.VariableTypeList,
			Schema: &vo.Variable{
				Name: "",
				Type: vo.VariableTypeString,
			},
		}

		err := s.UnwrapArrayItemFieldsInVariable(input)
		assert.NoError(t, err)
		assert.Equal(t, expected, input)
	})

	t.Run("handles nil input", func(t *testing.T) {
		err := s.UnwrapArrayItemFieldsInVariable(nil)
		assert.NoError(t, err)
	})
}