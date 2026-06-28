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
	"testing"

	adminconfig "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	bizmodelmgr "github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNormalizeWorkflowSchemaModelTypes(t *testing.T) {
	models := []*bizmodelmgr.Model{
		{
			Model: &adminconfig.Model{
				ID: 61030,
				DisplayInfo: &adminconfig.DisplayInfo{
					Name: "DeepSeek V4 Flash",
				},
				Connection: &adminconfig.Connection{
					BaseConnInfo: &adminconfig.BaseConnectionInfo{
						Model: "deepseek-v4-flash",
					},
				},
			},
		},
	}

	schema := map[string]any{
		"nodes": []any{
			map[string]any{
				"id": "llm-node",
				"data": map[string]any{
					"inputs": map[string]any{
						"llmParam": []any{
							map[string]any{
								"name": "modelType",
								"input": map[string]any{
									"type": "integer",
									"value": map[string]any{
										"type":    "literal",
										"content": "999",
										"rawMeta": map[string]any{"type": 2},
									},
								},
							},
							map[string]any{
								"name": "modleName",
								"input": map[string]any{
									"type": "string",
									"value": map[string]any{
										"type":    "literal",
										"content": "DeepSeek V4 Flash",
									},
								},
							},
						},
						"settingOnError": map[string]any{
							"ext": map[string]any{
								"backupLLMParam": `{"temperature":0.8,"topP":0.7,"responseFormat":2,"maxTokens":1024,"modelName":"DeepSeek V4 Flash","modelType":998,"generationDiversity":"default_val"}`,
							},
						},
					},
				},
			},
			map[string]any{
				"id": "qa-node",
				"data": map[string]any{
					"inputs": map[string]any{
						"llmParam": map[string]any{
							"modelName": "deepseek-v4-flash",
							"modelType": 123,
						},
					},
				},
			},
			map[string]any{
				"id": "intent-node",
				"data": map[string]any{
					"inputs": map[string]any{
						"llmParam": map[string]any{
							"modelName": "DeepSeek V4 Flash",
						},
					},
				},
			},
		},
	}

	schemaStr, err := sonic.MarshalString(schema)
	require.NoError(t, err)

	normalizedSchema, err := normalizeWorkflowSchemaModelTypes(schemaStr, newWorkflowSchemaModelResolver(models))
	require.NoError(t, err)

	var normalized map[string]any
	require.NoError(t, sonic.UnmarshalString(normalizedSchema, &normalized))

	nodes, ok := normalized["nodes"].([]any)
	require.True(t, ok)
	require.Len(t, nodes, 3)

	llmNode := nodes[0].(map[string]any)
	llmInputs := llmNode["data"].(map[string]any)["inputs"].(map[string]any)
	llmParams := llmInputs["llmParam"].([]any)
	assert.Equal(t, "61030", llmParams[0].(map[string]any)["input"].(map[string]any)["value"].(map[string]any)["content"])

	backupParamStr := llmInputs["settingOnError"].(map[string]any)["ext"].(map[string]any)["backupLLMParam"].(string)
	var backupParam vo.SimpleLLMParam
	require.NoError(t, sonic.UnmarshalString(backupParamStr, &backupParam))
	assert.Equal(t, int64(61030), backupParam.ModelType)

	qaNode := nodes[1].(map[string]any)
	qaModelType, ok := getWorkflowInt64(qaNode["data"].(map[string]any)["inputs"].(map[string]any)["llmParam"].(map[string]any)["modelType"])
	require.True(t, ok)
	assert.Equal(t, int64(61030), qaModelType)

	intentNode := nodes[2].(map[string]any)
	intentModelType, ok := getWorkflowInt64(intentNode["data"].(map[string]any)["inputs"].(map[string]any)["llmParam"].(map[string]any)["modelType"])
	require.True(t, ok)
	assert.Equal(t, int64(61030), intentModelType)
}

func TestNormalizeWorkflowSchemaModelTypesReturnsErrorForUnknownModel(t *testing.T) {
	models := []*bizmodelmgr.Model{
		{
			Model: &adminconfig.Model{
				ID: 61030,
				DisplayInfo: &adminconfig.DisplayInfo{
					Name: "DeepSeek V4 Flash",
				},
			},
		},
	}

	schemaStr := `{"nodes":[{"id":"llm-node","data":{"inputs":{"llmParam":{"modelName":"missing-model","modelType":1}}}}]}`

	_, err := normalizeWorkflowSchemaModelTypes(schemaStr, newWorkflowSchemaModelResolver(models))
	require.Error(t, err)
	assert.Contains(t, err.Error(), `model "missing-model" not found`)
}

func TestNormalizeWorkflowSchemaModelTypesReturnsErrorForAmbiguousModel(t *testing.T) {
	models := []*bizmodelmgr.Model{
		{
			Model: &adminconfig.Model{
				ID: 61030,
				DisplayInfo: &adminconfig.DisplayInfo{
					Name: "DeepSeek V4 Flash",
				},
			},
		},
		{
			Model: &adminconfig.Model{
				ID: 61031,
				DisplayInfo: &adminconfig.DisplayInfo{
					Name: "DeepSeek V4 Flash",
				},
			},
		},
	}

	schemaStr := `{"nodes":[{"id":"llm-node","data":{"inputs":{"llmParam":{"modelName":"DeepSeek V4 Flash","modelType":1}}}}]}`

	_, err := normalizeWorkflowSchemaModelTypes(schemaStr, newWorkflowSchemaModelResolver(models))
	require.Error(t, err)
	assert.Contains(t, err.Error(), `model "DeepSeek V4 Flash" is ambiguous`)
}
