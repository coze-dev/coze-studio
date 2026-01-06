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

package code

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/infra/coderunner"
	mockcode "github.com/coze-dev/coze-studio/backend/internal/mock/domain/workflow/crossdomain/code"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
)

var codeTpl string

func TestCode_RunCode(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockRunner := mockcode.NewMockRunner(ctrl)

	t.Run("normal", func(t *testing.T) {
		var codeTpl = `
async def main(args:Args)->Output:
    params = args.params
    ret: Output = {
        "key0": params['input'] + params['input'],
        "key1": ["hello", "world"], 
  		"key2": [123, "345"], 
        "key3": { 
            "key31": "hi",
			"key32": "hello",
			"key33": ["123","456"],
			"key34": {
				"key341":"123",			
				"key342":456,
				}
        },
    }
    return ret
`
		ret := map[string]any{
			"key0": int64(11231123),
			"key1": []any{"hello", "world"},
			"key2": []interface{}{int64(123), "345"},
			"key3": map[string]interface{}{"key31": "hi", "key32": "hello", "key33": []any{"123", "456"}, "key34": map[string]interface{}{"key341": "123", "key342": int64(456)}},
			"key4": []any{
				map[string]any{"key41": "41"},
				map[string]any{"key42": "42"},
			},
		}

		response := &coderunner.RunResponse{
			Result: ret,
		}

		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)
		ctx := t.Context()
		c := &Runner{
			language: coderunner.Python,
			code:     codeTpl,
			outputConfig: map[string]*vo.TypeInfo{
				"key0": {Type: vo.DataTypeInteger},
				"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString}},
				"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
				"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
					"key31": {Type: vo.DataTypeString},
					"key32": {Type: vo.DataTypeString},
					"key33": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key34": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key341": {Type: vo.DataTypeString},
						"key342": {Type: vo.DataTypeString},
					}},
				},
				},
				"key4": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject}},
			},
			runner: mockRunner,
		}

		ret, err := c.Invoke(ctx, map[string]any{
			"input": "1123",
		})

		bs, _ := json.Marshal(ret)
		fmt.Println(string(bs))

		assert.NoError(t, err)
		assert.Equal(t, int64(11231123), ret["key0"])
		assert.Equal(t, []any{"hello", "world"}, ret["key1"])
		assert.Equal(t, []any{float64(123), float64(345)}, ret["key2"])
		assert.Equal(t, []any{float64(123), float64(456)}, ret["key3"].(map[string]any)["key33"])
		assert.Equal(t, map[string]any{"key41": "41"}, ret["key4"].([]any)[0].(map[string]any))

	})
	t.Run("field not in return", func(t *testing.T) {
		codeTpl = `
async def main(args:Args)->Output:
    params = args.params
    ret: Output = {
        "key0": params['input'] + params['input'],
        "key1": ["hello", "world"], 
  		"key2": [123, "345"], 
        "key3": { 
            "key31": "hi",
			"key32": "hello",
			"key34": {
				"key341":"123"
				}
        },
    }
    return ret
`

		ret := map[string]any{
			"key0": int64(11231123),
			"key1": []any{"hello", "world"},
			"key2": []interface{}{int64(123), "345"},
			"key3": map[string]interface{}{"key31": "hi", "key32": "hello", "key34": map[string]interface{}{"key341": "123"}},
		}

		response := &coderunner.RunResponse{
			Result: ret,
		}
		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)

		ctx := t.Context()
		c := &Runner{
			code:     codeTpl,
			language: coderunner.Python,
			outputConfig: map[string]*vo.TypeInfo{
				"key0": {Type: vo.DataTypeInteger},
				"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString}},
				"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
				"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
					"key31": {Type: vo.DataTypeString},
					"key32": {Type: vo.DataTypeString},
					"key33": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key34": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key341": {Type: vo.DataTypeString},
						"key342": {Type: vo.DataTypeString},
					}},
				}},
				"key4": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
					"key31": {Type: vo.DataTypeString},
					"key32": {Type: vo.DataTypeString},
					"key33": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key34": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key341": {Type: vo.DataTypeString},
						"key342": {Type: vo.DataTypeString},
					},
					}},
				},
			},
			runner: mockRunner,
		}
		ret, err := c.Invoke(ctx, map[string]any{
			"input": "1123",
		})

		assert.NoError(t, err)
		assert.Equal(t, int64(11231123), ret["key0"])
		assert.Equal(t, []any{"hello", "world"}, ret["key1"])
		assert.Equal(t, []any{float64(123), float64(345)}, ret["key2"])
		assert.Equal(t, nil, ret["key4"])
		assert.Equal(t, nil, ret["key3"].(map[string]any)["key33"])
	})
	t.Run("field convert failed", func(t *testing.T) {
		codeTpl = `
async def main(args:Args)->Output:
    params = args.params
    ret: Output = {
        "key0": params['input'] + params['input'],
        "key1": ["hello", "world"], 
  		"key2": [123, "345"], 
        "key3": { 
            "key31": "hi",
			"key32": "hello",
			"key34": {
				"key341":"123",
				"key343": ["hello", "world"],
				}
        },
    }
    return ret
`
		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		ret := map[string]any{
			"key0": int64(11231123),
			"key1": []any{"hello", "world"},
			"key2": []interface{}{int64(123), "345"},
			"key3": map[string]interface{}{"key31": "hi", "key32": "hello", "key34": map[string]interface{}{"key341": "123", "key343": []any{"hello", "world"}}},
		}
		response := &coderunner.RunResponse{
			Result: ret,
		}
		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)

		c := &Runner{
			code:     codeTpl,
			language: coderunner.Python,
			outputConfig: map[string]*vo.TypeInfo{
				"key0": {Type: vo.DataTypeInteger},
				"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
				"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
				"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
					"key31": {Type: vo.DataTypeString},
					"key32": {Type: vo.DataTypeString},
					"key33": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key34": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key341": {Type: vo.DataTypeString},
						"key342": {Type: vo.DataTypeString},
						"key343": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					}},
				},
				},
			},
			runner: mockRunner,
		}
		ret, err := c.Invoke(ctx, map[string]any{
			"input": "1123",
		})

		assert.NoError(t, err)
		assert.NoError(t, err)
		assert.Equal(t, int64(11231123), ret["key0"])
		assert.Equal(t, []any{float64(123), float64(345)}, ret["key2"])

		warnings, ok := ctxcache.Get[nodes.ConversionWarnings](ctx, coderRunnerWarnErrorLevelCtxKey)
		assert.True(t, ok)
		s := warnings.Error()
		assert.Contains(t, s, "field key3.key34.key343.0 is not number")
		assert.Contains(t, s, "field key3.key34.key343.1 is not number")
		assert.Contains(t, s, "field key1.0 is not number")
		assert.Contains(t, s, "field key1.1 is not number")

	})
}
