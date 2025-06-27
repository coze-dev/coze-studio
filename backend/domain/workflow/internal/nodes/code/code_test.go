package code

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	mockcode "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
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

		response := &code.RunResponse{
			Result: ret,
		}

		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)
		ctx := t.Context()
		c := &CodeRunner{
			config: &Config{
				Language: code.Python,
				Code:     codeTpl,
				OutputConfig: map[string]*vo.TypeInfo{
					"key0": {Type: vo.DataTypeInteger},
					"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString}},
					"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key31": &vo.TypeInfo{Type: vo.DataTypeString},
						"key32": &vo.TypeInfo{Type: vo.DataTypeString},
						"key33": &vo.TypeInfo{Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
						"key34": &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
							"key341": &vo.TypeInfo{Type: vo.DataTypeString},
							"key342": &vo.TypeInfo{Type: vo.DataTypeString},
						}},
					},
					},
					"key4": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeObject}},
				},
				Runner: mockRunner,
			},
		}
		ret, err := c.RunCode(ctx, map[string]any{
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

		response := &code.RunResponse{
			Result: ret,
		}
		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)

		ctx := t.Context()
		c := &CodeRunner{
			config: &Config{
				Code:     codeTpl,
				Language: code.Python,
				OutputConfig: map[string]*vo.TypeInfo{
					"key0": {Type: vo.DataTypeInteger},
					"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString}},
					"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key31": &vo.TypeInfo{Type: vo.DataTypeString},
						"key32": &vo.TypeInfo{Type: vo.DataTypeString},
						"key33": &vo.TypeInfo{Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
						"key34": &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
							"key341": &vo.TypeInfo{Type: vo.DataTypeString},
							"key342": &vo.TypeInfo{Type: vo.DataTypeString},
						}},
					}},
					"key4": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key31": &vo.TypeInfo{Type: vo.DataTypeString},
						"key32": &vo.TypeInfo{Type: vo.DataTypeString},
						"key33": &vo.TypeInfo{Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
						"key34": &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
							"key341": &vo.TypeInfo{Type: vo.DataTypeString},
							"key342": &vo.TypeInfo{Type: vo.DataTypeString},
						},
						}},
					},
				},
				Runner: mockRunner,
			},
		}
		ret, err := c.RunCode(ctx, map[string]any{
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
		response := &code.RunResponse{
			Result: ret,
		}
		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(response, nil)

		c := &CodeRunner{
			config: &Config{
				Code:     codeTpl,
				Language: code.Python,
				OutputConfig: map[string]*vo.TypeInfo{
					"key0": {Type: vo.DataTypeInteger},
					"key1": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key2": {Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
					"key3": {Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
						"key31": &vo.TypeInfo{Type: vo.DataTypeString},
						"key32": &vo.TypeInfo{Type: vo.DataTypeString},
						"key33": &vo.TypeInfo{Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
						"key34": &vo.TypeInfo{Type: vo.DataTypeObject, Properties: map[string]*vo.TypeInfo{
							"key341": &vo.TypeInfo{Type: vo.DataTypeString},
							"key342": &vo.TypeInfo{Type: vo.DataTypeString},
							"key343": &vo.TypeInfo{Type: vo.DataTypeArray, ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeNumber}},
						}},
					},
					},
				},
				Runner: mockRunner,
			},
		}
		ret, err := c.RunCode(ctx, map[string]any{
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
