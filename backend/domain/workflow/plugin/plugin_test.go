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

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestToWorkflowAPIParameter(t *testing.T) {
	fileAssistType := common.AssistParameterType_DEFAULT

	testCases := []struct {
		name     string
		input    *common.APIParameter
		expected *workflow3.APIParameter
	}{
		{
			name:     "Nil Input",
			input:    nil,
			expected: nil,
		},
		{
			name: "Simple String Parameter",
			input: &common.APIParameter{
				Name: "prompt",
				Type: common.ParameterType_String,
			},
			expected: &workflow3.APIParameter{
				Name: "prompt",
				Type: workflow3.ParameterType_String,
			},
		},
		{
			name: "Simple Object Parameter",
			input: &common.APIParameter{
				Name: "user",
				Type: common.ParameterType_Object,
				SubParameters: []*common.APIParameter{
					{Name: "name", Type: common.ParameterType_String},
					{Name: "age", Type: common.ParameterType_Integer},
				},
			},
			expected: &workflow3.APIParameter{
				Name: "user",
				Type: workflow3.ParameterType_Object,
				SubParameters: []*workflow3.APIParameter{
					{Name: "name", Type: workflow3.ParameterType_String},
					{Name: "age", Type: workflow3.ParameterType_Integer},
				},
			},
		},
		{
			name: "Wrapped Array of Primitives (String)",
			input: &common.APIParameter{
				Name: "tags",
				Type: common.ParameterType_Array,
				SubParameters: []*common.APIParameter{
					{
						Name: "[Array Item]",
						Type: common.ParameterType_String,
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name:    "tags",
				Type:    workflow3.ParameterType_Array,
				SubType: ptr.Of(workflow3.ParameterType_String),
				SubParameters: []*workflow3.APIParameter{
					{
						Name: "[Array Item]",
						Type: workflow3.ParameterType_String,
					},
				},
			},
		},
		{
			name: "Wrapped Array of Primitives with AssistType (File)",
			input: &common.APIParameter{
				Name: "documents",
				Type: common.ParameterType_Array,
				SubParameters: []*common.APIParameter{
					{
						Name:       "[Array Item]",
						Type:       common.ParameterType_String,
						AssistType: &fileAssistType,
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name:    "documents",
				Type:    workflow3.ParameterType_Array,
				SubType: ptr.Of(workflow3.ParameterType_String),
				SubParameters: []*workflow3.APIParameter{
					{
						Name:       "[Array Item]",
						Type:       workflow3.ParameterType_String,
						AssistType: ptr.Of(workflow3.AssistParameterType(fileAssistType)),
					},
				},
			},
		},
		{
			name: "Wrapped Array of Objects",
			input: &common.APIParameter{
				Name: "users",
				Type: common.ParameterType_Array,
				SubParameters: []*common.APIParameter{
					{
						Name: "[Array Item]",
						Type: common.ParameterType_Object,
						SubParameters: []*common.APIParameter{
							{Name: "name", Type: common.ParameterType_String},
							{Name: "email", Type: common.ParameterType_String},
						},
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name:    "users",
				Type:    workflow3.ParameterType_Array,
				SubType: ptr.Of(workflow3.ParameterType_Object),
				SubParameters: []*workflow3.APIParameter{
					{Name: "name", Type: workflow3.ParameterType_String},
					{Name: "email", Type: workflow3.ParameterType_String},
				},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			actual := toWorkflowAPIParameter(tc.input)

			// Use require for nil checks to stop test early if it fails
			if tc.expected == nil {
				assert.Nil(t, actual)
				return
			}
			assert.NotNil(t, actual)

			assert.Equal(t, tc.expected.Name, actual.Name, "Name should match")
			assert.Equal(t, tc.expected.Type, actual.Type, "Type should match")

			if tc.expected.SubType != nil {
				assert.NotNil(t, actual.SubType, "SubType should not be nil")
				assert.Equal(t, *tc.expected.SubType, *actual.SubType, "SubType value should match")
			} else {
				assert.Nil(t, actual.SubType, "SubType should be nil")
			}

			assert.Equal(t, len(tc.expected.SubParameters), len(actual.SubParameters), "Number of sub-parameters should match")

			for i := range tc.expected.SubParameters {
				expectedSub := tc.expected.SubParameters[i]
				actualSub := actual.SubParameters[i]
				assert.Equal(t, expectedSub.Name, actualSub.Name, "Sub-parameter name should match")
				assert.Equal(t, expectedSub.Type, actualSub.Type, "Sub-parameter type should match")

				if expectedSub.AssistType != nil {
					assert.NotNil(t, actualSub.AssistType, "Sub-parameter AssistType should not be nil")
					assert.Equal(t, *expectedSub.AssistType, *actualSub.AssistType, "Sub-parameter AssistType value should match")
				} else {
					assert.Nil(t, actualSub.AssistType, "Sub-parameter AssistType should be nil")
				}
			}
		})
	}
}
