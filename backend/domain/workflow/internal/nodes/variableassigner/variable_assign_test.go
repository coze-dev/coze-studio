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

package variableassigner

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestVariableAssigner(t *testing.T) {
	intVar := any(1)
	strVar := any("str")
	objVar := any(map[string]any{
		"key": "value",
	})
	arrVar := any([]any{1, "2"})

	va := &InLoop{
		pairs: []*Pair{
			{
				Left: vo.Reference{
					FromPath:     compose.FieldPath{"int_var_s"},
					VariableType: ptr.Of(vo.ParentIntermediate),
				},
				Right: compose.FieldPath{"int_var_t"},
			},
			{
				Left: vo.Reference{
					FromPath:     compose.FieldPath{"str_var_s"},
					VariableType: ptr.Of(vo.ParentIntermediate),
				},
				Right: compose.FieldPath{"str_var_t"},
			},
			{
				Left: vo.Reference{
					FromPath:     compose.FieldPath{"obj_var_s"},
					VariableType: ptr.Of(vo.ParentIntermediate),
				},
				Right: compose.FieldPath{"obj_var_t"},
			},
			{
				Left: vo.Reference{
					FromPath:     compose.FieldPath{"arr_var_s"},
					VariableType: ptr.Of(vo.ParentIntermediate),
				},
				Right: compose.FieldPath{"arr_var_t"},
			},
		},
		intermediateVarStore: &nodes.ParentIntermediateStore{},
	}

	ctx := nodes.InitIntermediateVars(context.Background(), map[string]*any{
		"int_var_s": &intVar,
		"str_var_s": &strVar,
		"obj_var_s": &objVar,
		"arr_var_s": &arrVar,
	}, nil)

	_, err := va.Invoke(ctx, map[string]any{
		"int_var_t": 2,
		"str_var_t": "str2",
		"obj_var_t": map[string]any{
			"key2": "value2",
		},
		"arr_var_t": []any{3, "4"},
	})
	assert.NoError(t, err)

	assert.Equal(t, 2, intVar)
	assert.Equal(t, "str2", strVar)
	assert.Equal(t, map[string]any{
		"key2": "value2",
	}, objVar)
	assert.Equal(t, []any{3, "4"}, arrVar)
}
