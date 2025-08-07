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

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/stretchr/testify/assert"
)

func TestToWorkflowAPIParameter(t *testing.T) {
	cases := []struct {
		name     string
		param    *common.APIParameter
		expected *workflow3.APIParameter
	}{
		{
			name:     "nil parameter",
			param:    nil,
			expected: nil,
		},
		{
			name: "simple string parameter",
			param: &common.APIParameter{
				Name: "prompt",
				Type: common.ParameterType_String,
				Desc: "User's prompt",
			},
			expected: &workflow3.APIParameter{
				Name: "prompt",
				Type: workflow3.ParameterType_String,
				Desc: "User's prompt",
			},
		},
		{
			name: "simple object parameter",
			param: &common.APIParameter{
				Name: "user_info",
				Type: common.ParameterType_Object,
				SubParameters: []*common.APIParameter{
					{
						Name: "name",
						Type: common.ParameterType_String,
					},
					{
						Name: "age",
						Type: common.ParameterType_Number,
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name: "user_info",
				Type: workflow3.ParameterType_Object,
				SubParameters: []*workflow3.APIParameter{
					{
						Name: "name",
						Type: workflow3.ParameterType_String,
					},
					{
						Name: "age",
						Type: workflow3.ParameterType_Number,
					},
				},
			},
		},
		{
			name: "array of strings",
			param: &common.APIParameter{
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
						Type: workflow3.ParameterType_String,
					},
				},
			},
		},
		{
			name: "array of objects",
			param: &common.APIParameter{
				Name: "users",
				Type: common.ParameterType_Array,
				SubParameters: []*common.APIParameter{
					{
						Name: "[Array Item]",
						Type: common.ParameterType_Object,
						SubParameters: []*common.APIParameter{
							{
								Name: "name",
								Type: common.ParameterType_String,
							},
							{
								Name: "id",
								Type: common.ParameterType_Number,
							},
						},
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name:    "users",
				Type:    workflow3.ParameterType_Array,
				SubType: ptr.Of(workflow3.ParameterType_Object),
				SubParameters: []*workflow3.APIParameter{
					{
						Name: "name",
						Type: workflow3.ParameterType_String,
					},
					{
						Name: "id",
						Type: workflow3.ParameterType_Number,
					},
				},
			},
		},
		{
			name: "array of array of strings",
			param: &common.APIParameter{
				Name: "matrix",
				Type: common.ParameterType_Array,
				SubParameters: []*common.APIParameter{
					{
						Name: "[Array Item]",
						Type: common.ParameterType_Array,
						SubParameters: []*common.APIParameter{
							{
								Name: "[Array Item]",
								Type: common.ParameterType_String,
							},
						},
					},
				},
			},
			expected: &workflow3.APIParameter{
				Name:    "matrix",
				Type:    workflow3.ParameterType_Array,
				SubType: ptr.Of(workflow3.ParameterType_Array),
				SubParameters: []*workflow3.APIParameter{
					{
						Name:    "", // Name is cleared
						Type:    workflow3.ParameterType_Array,
						SubType: ptr.Of(workflow3.ParameterType_String),
						SubParameters: []*workflow3.APIParameter{
							{
								Type: workflow3.ParameterType_String,
							},
						},
					},
				},
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			actual := toWorkflowAPIParameter(tc.param)
			assert.Equal(t, tc.expected, actual)
		})
	}
}
