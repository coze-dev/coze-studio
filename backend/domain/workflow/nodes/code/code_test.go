package code

import (
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	mockcode "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow/crossdomain/code"
)

var codeTpl string

func ToPtr[T any](t T) *T {
	return &t
}

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
			"key0": 11231123,
			"key1": []any{"hello", "world"},
			"key2": []interface{}{123, "345"},
			"key3": map[string]interface{}{"key31": "hi", "key32": "hello", "key33": []any{"123", "456"}, "key34": map[string]interface{}{"key341": "123", "key342": 456}},
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
				OutputConfig: map[string]*nodes.TypeInfo{
					"key0": {Type: nodes.DataTypeInteger},
					"key1": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeString)},
					"key2": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key3": {Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
						"key31": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key32": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key33": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						"key34": &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
							"key341": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key342": &nodes.TypeInfo{Type: nodes.DataTypeString},
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

		bs, _ := json.Marshal(ret)
		fmt.Println(string(bs))

		assert.NoError(t, err)
		assert.Equal(t, int64(11231123), ret["key0"])
		assert.Equal(t, []string{"hello", "world"}, ret["key1"])
		assert.Equal(t, []float64{123, 345}, ret["key2"])
		assert.Equal(t, []float64{123, 456}, ret["key3"].(map[string]any)["key33"])
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
			"key0": 11231123,
			"key1": []any{"hello", "world"},
			"key2": []interface{}{123, "345"},
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
				OutputConfig: map[string]*nodes.TypeInfo{
					"key0": {Type: nodes.DataTypeInteger},
					"key1": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeString)},
					"key2": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key3": {Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
						"key31": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key32": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key33": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						"key34": &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
							"key341": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key342": &nodes.TypeInfo{Type: nodes.DataTypeString},
						}},
					}},
					"key4": {Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
						"key31": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key32": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key33": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						"key34": &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
							"key341": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key342": &nodes.TypeInfo{Type: nodes.DataTypeString},
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
		assert.Equal(t, []string{"hello", "world"}, ret["key1"])
		assert.Equal(t, []float64{123, 345}, ret["key2"])
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
		ret := map[string]any{
			"key0": 11231123,
			"key1": []any{"hello", "world"},
			"key2": []interface{}{123, "345"},
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
				OutputConfig: map[string]*nodes.TypeInfo{
					"key0": {Type: nodes.DataTypeInteger},
					"key1": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key2": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key3": {Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
						"key31": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key32": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key33": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						"key34": &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
							"key341": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key342": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key343": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
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
		assert.Equal(t, []float64{123, 345}, ret["key2"])
		assert.Contains(t, ret[occurWarnErrorKey], "field key3.key34.key343.0 is not a number")
		assert.Contains(t, ret[occurWarnErrorKey], "field key3.key34.key343.1 is not a number")
		assert.Contains(t, ret[occurWarnErrorKey], "field key1.0 is not a number")
		assert.Contains(t, ret[occurWarnErrorKey], "field key1.1 is not a number")

	})

	t.Run("run code error", func(t *testing.T) {
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

		mockRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(nil, errors.New("error"))

		c := &CodeRunner{
			config: &Config{
				Code:     codeTpl,
				Language: code.Python,
				OutputConfig: map[string]*nodes.TypeInfo{
					"key0": {Type: nodes.DataTypeInteger},
					"key1": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key2": {Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
					"key3": {Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
						"key31": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key32": &nodes.TypeInfo{Type: nodes.DataTypeString},
						"key33": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						"key34": &nodes.TypeInfo{Type: nodes.DataTypeObject, Properties: map[string]*nodes.TypeInfo{
							"key341": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key342": &nodes.TypeInfo{Type: nodes.DataTypeString},
							"key343": &nodes.TypeInfo{Type: nodes.DataTypeArray, ElemType: ToPtr(nodes.DataTypeNumber)},
						}},
					},
					},
				},
				Runner:          mockRunner,
				IgnoreException: true,
				DefaultOutput: map[string]any{
					"key1": 0,
				},
			},
		}
		ret, err := c.RunCode(ctx, map[string]any{
			"input": "1123",
		})
		assert.NoError(t, err)

		assert.Equal(t, int(0), ret["key1"])
		assert.Equal(t, errors.New("error").Error(), ret["errorBody"].(map[string]interface{})["errorMessage"])

	})

}
