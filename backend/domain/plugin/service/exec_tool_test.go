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

package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
)

func TestToolExecutorProcessWithInvalidRespProcessStrategyOfReturnDefault(t *testing.T) {
	executor := &toolExecutor{
		invalidRespProcessStrategy: consts.InvalidResponseProcessStrategyOfReturnDefault,
	}

	paramVal := `
{
	"a1": 1,
	"b1": {
		"a2": 2.1
	},
	"c1": [
		{
			"a2": 3.1
		}
	],
	"d1": "hello",
	"f1": true
}
`

	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(paramVal))
	decoder.UseNumber()
	paramValMap := map[string]any{}
	err := decoder.Decode(&paramValMap)
	assert.NoError(t, err)

	paramSchema := &openapi3.Schema{
		Type: openapi3.TypeObject,
		Properties: map[string]*openapi3.SchemaRef{
			"a1": {
				Value: &openapi3.Schema{
					Type: openapi3.TypeInteger,
				},
			},
			"b1": {
				Value: &openapi3.Schema{
					Type: openapi3.TypeObject,
					Properties: map[string]*openapi3.SchemaRef{
						"a2": {
							Value: &openapi3.Schema{
								Type: openapi3.TypeNumber,
							},
						},
					},
				},
			},
			"c1": {
				Value: &openapi3.Schema{
					Type: openapi3.TypeArray,
					Items: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Type: openapi3.TypeObject,
							Properties: map[string]*openapi3.SchemaRef{
								"a2": {
									Value: &openapi3.Schema{
										Type: openapi3.TypeNumber,
									},
								},
							},
						},
					},
				},
			},
			"d1": {
				Value: &openapi3.Schema{
					Type: openapi3.TypeString,
				},
			},
			"f1": {
				Value: &openapi3.Schema{
					Type: openapi3.TypeBoolean,
				},
			},
		},
	}

	processedParamValMap, err := executor.processWithInvalidRespProcessStrategyOfReturnDefault(context.Background(), paramValMap, paramSchema)
	assert.NoError(t, err)
	assert.NotNil(t, processedParamValMap)
	assert.Equal(t, int64(1), processedParamValMap["a1"])
	assert.Equal(t, json.Number("2.1"), processedParamValMap["b1"].(map[string]any)["a2"])
	assert.Equal(t, json.Number("3.1"), processedParamValMap["c1"].([]any)[0].(map[string]any)["a2"])
	assert.Equal(t, "hello", processedParamValMap["d1"])
	assert.Equal(t, true, processedParamValMap["f1"])
}

func TestToolExecutorProcessWithInvalidRespProcessStrategyOfReturnErr(t *testing.T) {
	executor := &toolExecutor{
		invalidRespProcessStrategy: consts.InvalidResponseProcessStrategyOfReturnErr,
	}

	mockey.PatchConvey("integer", t, func() {
		paramVal := `
{
	"a": 1
}
`

		decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(paramVal))
		decoder.UseNumber()
		paramValMap := map[string]any{}
		err := decoder.Decode(&paramValMap)
		assert.NoError(t, err)

		paramSchema := &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		var customErr errorx.StatusError
		assert.True(t, errors.As(err, &customErr))
		assert.Equal(t, "execute tool failed : expected 'a' to be of type 'string', but got 'json.Number'", customErr.Msg())

		paramSchema = &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a1": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeInteger,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		assert.NoError(t, err)
	})

	mockey.PatchConvey("string", t, func() {
		paramVal := `
{
	"a": "1"
}
`

		decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(paramVal))
		decoder.UseNumber()
		paramValMap := map[string]any{}
		err := decoder.Decode(&paramValMap)
		assert.NoError(t, err)

		paramSchema := &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeInteger,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		var customErr errorx.StatusError
		assert.True(t, errors.As(err, &customErr))
		assert.Equal(t, "execute tool failed : expected 'a' to be of type 'integer', but got 'string'", customErr.Msg())

		paramSchema = &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		assert.NoError(t, err)
	})

	mockey.PatchConvey("boolean", t, func() {
		paramVal := `
{
	"a": false
}
`

		decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(paramVal))
		decoder.UseNumber()
		paramValMap := map[string]any{}
		err := decoder.Decode(&paramValMap)
		assert.NoError(t, err)

		paramSchema := &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		var customErr errorx.StatusError
		assert.True(t, errors.As(err, &customErr))
		assert.Equal(t, "execute tool failed : expected 'a' to be of type 'string', but got 'bool'", customErr.Msg())

		paramSchema = &openapi3.Schema{
			Type: openapi3.TypeObject,
			Properties: map[string]*openapi3.SchemaRef{
				"a": {
					Value: &openapi3.Schema{
						Type: openapi3.TypeBoolean,
					},
				},
			},
		}
		_, err = executor.processWithInvalidRespProcessStrategyOfReturnErr(context.Background(), paramValMap, paramSchema)
		assert.NoError(t, err)
	})
}
