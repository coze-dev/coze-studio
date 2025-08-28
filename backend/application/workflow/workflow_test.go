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

package workflow

import (
	"fmt"
	"strings"
	"testing"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestToVariable(t *testing.T) {
	fileAssistType := workflow.AssistParameterType_DEFAULT

	testCases := []struct {
		name          string
		input         *workflow.APIParameter
		expected      *vo.Variable
		expectErr     bool
		expectedErrAs any
	}{
		{
			name:     "Nil Input",
			input:    nil,
			expected: nil,
		},
		{
			name: "Simple String",
			input: &workflow.APIParameter{
				Name: "prompt", Type: workflow.ParameterType_String, IsRequired: true,
			},
			expected: &vo.Variable{
				Name: "prompt", Type: vo.VariableTypeString, Required: true,
			},
		},
		{
			name: "Simple Object",
			input: &workflow.APIParameter{
				Name: "user",
				Type: workflow.ParameterType_Object,
				SubParameters: []*workflow.APIParameter{
					{Name: "name", Type: workflow.ParameterType_String},
					{Name: "age", Type: workflow.ParameterType_Integer},
				},
			},
			expected: &vo.Variable{
				Name: "user",
				Type: vo.VariableTypeObject,
				Schema: []*vo.Variable{
					{Name: "name", Type: vo.VariableTypeString},
					{Name: "age", Type: vo.VariableTypeInteger},
				},
			},
		},
		{
			name: "Array of Objects",
			input: &workflow.APIParameter{
				Name:    "items",
				Type:    workflow.ParameterType_Array,
				SubType: ptr.Of(workflow.ParameterType_Object),
				SubParameters: []*workflow.APIParameter{
					{Name: "id", Type: workflow.ParameterType_String},
					{Name: "price", Type: workflow.ParameterType_Number},
				},
			},
			expected: &vo.Variable{
				Name: "items",
				Type: vo.VariableTypeList,
				Schema: &vo.Variable{
					Type: vo.VariableTypeObject,
					Schema: []*vo.Variable{
						{Name: "id", Type: vo.VariableTypeString},
						{Name: "price", Type: vo.VariableTypeFloat},
					},
				},
			},
		},
		{
			name: "Array of Primitives (File)",
			input: &workflow.APIParameter{
				Name:    "attachments",
				Type:    workflow.ParameterType_Array,
				SubType: ptr.Of(workflow.ParameterType_String),
				SubParameters: []*workflow.APIParameter{
					{AssistType: &fileAssistType},
				},
			},
			expected: &vo.Variable{
				Name: "attachments",
				Type: vo.VariableTypeList,
				Schema: &vo.Variable{
					Type:       vo.VariableTypeString,
					AssistType: vo.AssistType(fileAssistType),
				},
			},
		},
		{
			name: "Array of Primitives (String)",
			input: &workflow.APIParameter{
				Name:    "tags",
				Type:    workflow.ParameterType_Array,
				SubType: ptr.Of(workflow.ParameterType_String),
			},
			expected: &vo.Variable{
				Name: "tags",
				Type: vo.VariableTypeList,
				Schema: &vo.Variable{
					Type: vo.VariableTypeString,
				},
			},
		},
		{
			name: "Array with missing SubType",
			input: &workflow.APIParameter{
				Name: "bad_array",
				Type: workflow.ParameterType_Array,
			},
			expectErr:     true,
			expectedErrAs: "missing a SubType",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			actual, err := toVariable(tc.input)

			if tc.expectErr {
				require.Error(t, err)
				if tc.expectedErrAs != nil {
					assert.True(t, strings.Contains(err.Error(), fmt.Sprint(tc.expectedErrAs)))
				}
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tc.expected, actual)
		})
	}
}
