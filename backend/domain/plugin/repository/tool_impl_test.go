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

package repository

import (
	"testing"

	"github.com/stretchr/testify/assert"

	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
)

func TestConvertJsonSchemaToParameters(t *testing.T) {
	tests := []struct {
		name     string
		schema   *dto.JsonSchema
		expected int // expected number of parameters
		validate func(t *testing.T, params []*pluginCommon.APIParameter)
	}{
		{
			name: "Simple object with properties",
			schema: &dto.JsonSchema{
				Type: dto.JsonSchemaType_OBJECT,
				Properties: map[string]*dto.JsonSchema{
					"name": {
						Type:        dto.JsonSchemaType_STRING,
						Description: "User name",
					},
					"age": {
						Type:        dto.JsonSchemaType_INTEGER,
						Description: "User age",
					},
				},
				Required: []string{"name"},
			},
			expected: 2,
			validate: func(t *testing.T, params []*pluginCommon.APIParameter) {
				assert.Len(t, params, 2)

				// Find name parameter
				var nameParam *pluginCommon.APIParameter
				for _, p := range params {
					if p.Name == "name" {
						nameParam = p
						break
					}
				}
				assert.NotNil(t, nameParam)
				assert.True(t, nameParam.IsRequired)
				assert.Equal(t, pluginCommon.ParameterType_String, nameParam.Type)
			},
		},
		{
			name: "Array with object items",
			schema: &dto.JsonSchema{
				Type: dto.JsonSchemaType_OBJECT,
				Properties: map[string]*dto.JsonSchema{
					"users": {
						Type: dto.JsonSchemaType_ARRAY,
						Items: &dto.JsonSchema{
							Type: dto.JsonSchemaType_OBJECT,
							Properties: map[string]*dto.JsonSchema{
								"name": {
									Type:        dto.JsonSchemaType_STRING,
									Description: "User name",
								},
								"email": {
									Type:        dto.JsonSchemaType_STRING,
									Description: "User email",
								},
							},
							Required: []string{"name"},
						},
					},
				},
			},
			expected: 1,
			validate: func(t *testing.T, params []*pluginCommon.APIParameter) {
				assert.Len(t, params, 1)

				usersParam := params[0]
				assert.Equal(t, "users", usersParam.Name)
				assert.Equal(t, pluginCommon.ParameterType_Array, usersParam.Type)

				// Check array item parameter
				assert.Len(t, usersParam.SubParameters, 1)
				arrayItemParam := usersParam.SubParameters[0]
				assert.Equal(t, "[Array Item]", arrayItemParam.Name)
				assert.Equal(t, pluginCommon.ParameterType_Object, arrayItemParam.Type)

				// Check object properties in array item
				assert.Len(t, arrayItemParam.SubParameters, 2)

				// Find name parameter in array item
				var nameParam *pluginCommon.APIParameter
				for _, p := range arrayItemParam.SubParameters {
					if p.Name == "name" {
						nameParam = p
						break
					}
				}
				assert.NotNil(t, nameParam)
				assert.True(t, nameParam.IsRequired)
				assert.Equal(t, pluginCommon.ParameterType_String, nameParam.Type)
			},
		},
		{
			name: "Nested arrays",
			schema: &dto.JsonSchema{
				Type: dto.JsonSchemaType_OBJECT,
				Properties: map[string]*dto.JsonSchema{
					"matrix": {
						Type: dto.JsonSchemaType_ARRAY,
						Items: &dto.JsonSchema{
							Type: dto.JsonSchemaType_ARRAY,
							Items: &dto.JsonSchema{
								Type:        dto.JsonSchemaType_INTEGER,
								Description: "Matrix element",
							},
						},
					},
				},
			},
			expected: 1,
			validate: func(t *testing.T, params []*pluginCommon.APIParameter) {
				assert.Len(t, params, 1)

				matrixParam := params[0]
				assert.Equal(t, "matrix", matrixParam.Name)
				assert.Equal(t, pluginCommon.ParameterType_Array, matrixParam.Type)

				// Check first level array item
				assert.Len(t, matrixParam.SubParameters, 1)
				firstLevelItem := matrixParam.SubParameters[0]
				assert.Equal(t, "[Array Item]", firstLevelItem.Name)
				assert.Equal(t, pluginCommon.ParameterType_Array, firstLevelItem.Type)

				// Check second level array item
				assert.Len(t, firstLevelItem.SubParameters, 1)
				secondLevelItem := firstLevelItem.SubParameters[0]
				assert.Equal(t, "[Array Item]", secondLevelItem.Name)
				assert.Equal(t, pluginCommon.ParameterType_Integer, secondLevelItem.Type)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertJsonSchemaToParameters(tt.schema, pluginCommon.ParameterLocation_Body)
			assert.Len(t, result, tt.expected)
			if tt.validate != nil {
				tt.validate(t, result)
			}
		})
	}
}

func TestConvertFromJsonSchema(t *testing.T) {
	// Test the main entry function
	schema := &dto.JsonSchema{
		Type: dto.JsonSchemaType_OBJECT,
		Properties: map[string]*dto.JsonSchema{
			"test": {
				Type:        dto.JsonSchemaType_STRING,
				Description: "Test field",
			},
		},
	}

	result := convertFromJsonSchema(schema)
	assert.Len(t, result, 1)
	assert.Equal(t, "test", result[0].Name)
	assert.Equal(t, pluginCommon.ParameterLocation_Body, result[0].Location)
}
