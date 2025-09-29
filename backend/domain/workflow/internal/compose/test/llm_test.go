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

package test

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/callbacks"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	crossmodelmgr "github.com/coze-dev/coze-studio/backend/crossdomain/contract/modelmgr"
	mockmodel "github.com/coze-dev/coze-studio/backend/crossdomain/contract/modelmgr/modelmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	compose2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/emitter"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/entry"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/llm"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/infra/modelmgr"
	"github.com/coze-dev/coze-studio/backend/internal/testutil"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
)

func TestLLM(t *testing.T) {
	mockey.PatchConvey("test llm", t, func() {
		accessKey := os.Getenv("OPENAI_API_KEY")
		baseURL := os.Getenv("OPENAI_BASE_URL")
		modelName := os.Getenv("OPENAI_MODEL_NAME")
		var (
			openaiModel, deepSeekModel model2.BaseChatModel
			err                        error
		)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(crossmodelmgr.DefaultSVC).Return(mockModelManager).Build()

		if len(accessKey) > 0 && len(baseURL) > 0 && len(modelName) > 0 {
			openaiModel, err = openai.NewChatModel(context.Background(), &openai.ChatModelConfig{
				APIKey:  accessKey,
				ByAzure: true,
				BaseURL: baseURL,
				Model:   modelName,
			})
			assert.NoError(t, err)
		}

		deepSeekModelName := os.Getenv("DEEPSEEK_MODEL_NAME")
		if len(accessKey) > 0 && len(baseURL) > 0 && len(deepSeekModelName) > 0 {
			deepSeekModel, err = deepseek.NewChatModel(context.Background(), &deepseek.ChatModelConfig{
				APIKey:  accessKey,
				BaseURL: baseURL,
				Model:   deepSeekModelName,
			})
			assert.NoError(t, err)
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelName == modelName {
				return openaiModel, nil, nil
			} else if params.ModelName == deepSeekModelName {
				return deepSeekModel, nil, nil
			} else {
				return nil, nil, fmt.Errorf("invalid model name: %s", params.ModelName)
			}
		}).AnyTimes()

		ctx := ctxcache.Init(context.Background())

		defer mockey.Mock(execute.GetExeCtx).Return(&execute.Context{
			RootCtx: execute.RootCtx{
				ExeCfg: workflowModel.ExecuteConfig{
					WorkflowMode: 0,
				},
			},
			NodeCtx: &execute.NodeCtx{},
		}).Build().UnPatch()
		t.Run("plain text output, non-streaming mode", func(t *testing.T) {
			if openaiModel == nil {
				defer func() {
					openaiModel = nil
				}()
				openaiModel = &testutil.UTChatModel{
					InvokeResultProvider: func(_ int, in []*schema.Message) (*schema.Message, error) {
						return &schema.Message{
							Role:    schema.Assistant,
							Content: "I don't know",
						}, nil
					},
				}
			}

			entryN := &schema2.NodeSchema{
				Key:     entity.EntryNodeKey,
				Type:    entity.NodeTypeEntry,
				Configs: &entry.Config{},
			}

			llmNode := &schema2.NodeSchema{
				Key:  "llm_node_key",
				Type: entity.NodeTypeLLM,
				Configs: &llm.Config{
					SystemPrompt: "{{sys_prompt}}",
					UserPrompt:   "{{query}}",
					OutputFormat: llm.FormatText,
					LLMParams: &model.LLMParams{
						ModelName: modelName,
					},
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"sys_prompt"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entryN.Key,
								FromPath:    compose.FieldPath{"sys_prompt"},
							},
						},
					},
					{
						Path: compose.FieldPath{"query"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entryN.Key,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
				InputTypes: map[string]*vo.TypeInfo{
					"sys_prompt": {
						Type: vo.DataTypeString,
					},
					"query": {
						Type: vo.DataTypeString,
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"output": {
						Type: vo.DataTypeString,
					},
				},
			}

			exitN := &schema2.NodeSchema{
				Key:  entity.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: &exit.Config{
					TerminatePlan: vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: llmNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
				},
			}

			ws := &schema2.WorkflowSchema{
				Nodes: []*schema2.NodeSchema{
					entryN,
					llmNode,
					exitN,
				},
				Connections: []*schema2.Connection{
					{
						FromNode: entryN.Key,
						ToNode:   llmNode.Key,
					},
					{
						FromNode: llmNode.Key,
						ToNode:   exitN.Key,
					},
				},
			}

			ws.Init()

			wf, err := compose2.NewWorkflow(ctx, ws)
			assert.NoError(t, err)

			out, err := wf.Runner.Invoke(ctx, map[string]any{
				"sys_prompt": "you are a helpful assistant",
				"query":      "what's your name",
			})
			assert.NoError(t, err)
			assert.Greater(t, len(out), 0)
			assert.Greater(t, len(out["output"].(string)), 0)
		})

		t.Run("json output", func(t *testing.T) {
			if openaiModel == nil {
				defer func() {
					openaiModel = nil
				}()
				openaiModel = &testutil.UTChatModel{
					InvokeResultProvider: func(_ int, in []*schema.Message) (*schema.Message, error) {
						return &schema.Message{
							Role:    schema.Assistant,
							Content: `{"country_name": "Russia", "area_size": 17075400}`,
						}, nil
					},
				}
			}

			entryN := &schema2.NodeSchema{
				Key:     entity.EntryNodeKey,
				Type:    entity.NodeTypeEntry,
				Configs: &entry.Config{},
			}

			llmNode := &schema2.NodeSchema{
				Key:  "llm_node_key",
				Type: entity.NodeTypeLLM,
				Configs: &llm.Config{
					SystemPrompt: "you are a helpful assistant",
					UserPrompt:   "what's the largest country in the world and it's area size in square kilometers?",
					OutputFormat: llm.FormatJSON,
					LLMParams: &model.LLMParams{
						ModelName: modelName,
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"country_name": {
						Type:     vo.DataTypeString,
						Required: true,
					},
					"area_size": {
						Type:     vo.DataTypeInteger,
						Required: true,
					},
				},
			}

			exitN := &schema2.NodeSchema{
				Key:  entity.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: &exit.Config{
					TerminatePlan: vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"country_name"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: llmNode.Key,
								FromPath:    compose.FieldPath{"country_name"},
							},
						},
					},
					{
						Path: compose.FieldPath{"area_size"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: llmNode.Key,
								FromPath:    compose.FieldPath{"area_size"},
							},
						},
					},
				},
			}

			ws := &schema2.WorkflowSchema{
				Nodes: []*schema2.NodeSchema{
					entryN,
					llmNode,
					exitN,
				},
				Connections: []*schema2.Connection{
					{
						FromNode: entryN.Key,
						ToNode:   llmNode.Key,
					},
					{
						FromNode: llmNode.Key,
						ToNode:   exitN.Key,
					},
				},
			}

			ws.Init()

			wf, err := compose2.NewWorkflow(ctx, ws)
			assert.NoError(t, err)

			out, err := wf.Runner.Invoke(ctx, map[string]any{})
			assert.NoError(t, err)

			assert.Equal(t, out["country_name"], "Russia")
			assert.Greater(t, out["area_size"], int64(1000))
		})

		t.Run("markdown output", func(t *testing.T) {
			if openaiModel == nil {
				defer func() {
					openaiModel = nil
				}()
				openaiModel = &testutil.UTChatModel{
					InvokeResultProvider: func(_ int, in []*schema.Message) (*schema.Message, error) {
						return &schema.Message{
							Role:    schema.Assistant,
							Content: `#Top 5 Largest Countries in the World ## 1. Russia 2. Canada 3. United States 4. Brazil 5. Japan`,
						}, nil
					},
				}
			}

			entryN := &schema2.NodeSchema{
				Key:     entity.EntryNodeKey,
				Type:    entity.NodeTypeEntry,
				Configs: &entry.Config{},
			}

			llmNode := &schema2.NodeSchema{
				Key:  "llm_node_key",
				Type: entity.NodeTypeLLM,
				Configs: &llm.Config{
					SystemPrompt: "you are a helpful assistant",
					UserPrompt:   "list the top 5 largest countries in the world",
					OutputFormat: llm.FormatMarkdown,
					LLMParams: &model.LLMParams{
						ModelName: modelName,
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"output": {
						Type: vo.DataTypeString,
					},
				},
			}

			exitN := &schema2.NodeSchema{
				Key:  entity.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: &exit.Config{
					TerminatePlan: vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: llmNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
				},
			}

			ws := &schema2.WorkflowSchema{
				Nodes: []*schema2.NodeSchema{
					entryN,
					llmNode,
					exitN,
				},
				Connections: []*schema2.Connection{
					{
						FromNode: entryN.Key,
						ToNode:   llmNode.Key,
					},
					{
						FromNode: llmNode.Key,
						ToNode:   exitN.Key,
					},
				},
			}

			ws.Init()

			wf, err := compose2.NewWorkflow(ctx, ws)
			assert.NoError(t, err)

			out, err := wf.Runner.Invoke(ctx, map[string]any{})
			assert.NoError(t, err)
			assert.Greater(t, len(out["output"].(string)), 0)
		})

		t.Run("plain text output, streaming mode", func(t *testing.T) {
			// start -> fan out to openai LLM and deepseek LLM -> fan in to output emitter -> end
			if openaiModel == nil || deepSeekModel == nil {
				if openaiModel == nil {
					defer func() {
						openaiModel = nil
					}()
					openaiModel = &testutil.UTChatModel{
						StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
							sr := schema.StreamReaderFromArray([]*schema.Message{
								{
									Role:    schema.Assistant,
									Content: "I ",
								},
								{
									Role:    schema.Assistant,
									Content: "don't know.",
								},
							})
							return sr, nil
						},
					}
				}

				if deepSeekModel == nil {
					defer func() {
						deepSeekModel = nil
					}()
					deepSeekModel = &testutil.UTChatModel{
						StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
							sr := schema.StreamReaderFromArray([]*schema.Message{
								{
									Role:    schema.Assistant,
									Content: "I ",
								},
								{
									Role:    schema.Assistant,
									Content: "don't know too.",
								},
							})
							return sr, nil
						},
					}
				}
			}

			entryN := &schema2.NodeSchema{
				Key:     entity.EntryNodeKey,
				Type:    entity.NodeTypeEntry,
				Configs: &entry.Config{},
			}

			openaiNode := &schema2.NodeSchema{
				Key:  "openai_llm_node_key",
				Type: entity.NodeTypeLLM,
				Configs: &llm.Config{
					SystemPrompt: "you are a helpful assistant",
					UserPrompt:   "plan a 10 day family visit to China.",
					OutputFormat: llm.FormatText,
					LLMParams: &model.LLMParams{
						ModelName: modelName,
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"output": {
						Type: vo.DataTypeString,
					},
				},
			}

			deepseekNode := &schema2.NodeSchema{
				Key:  "deepseek_llm_node_key",
				Type: entity.NodeTypeLLM,
				Configs: &llm.Config{
					SystemPrompt: "you are a helpful assistant",
					UserPrompt:   "thoroughly plan a 10 day family visit to China. Use your reasoning ability.",
					OutputFormat: llm.FormatText,
					LLMParams: &model.LLMParams{
						ModelName: modelName,
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"output": {
						Type: vo.DataTypeString,
					},
					"reasoning_content": {
						Type: vo.DataTypeString,
					},
				},
			}

			emitterNode := &schema2.NodeSchema{
				Key:  "emitter_node_key",
				Type: entity.NodeTypeOutputEmitter,
				Configs: &emitter.Config{
					Template: "prefix {{inputObj.field1}} {{input2}} {{deepseek_reasoning}} \n\n###\n\n {{openai_output}} \n\n###\n\n {{deepseek_output}} {{inputObj.field2}} suffix",
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"openai_output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: openaiNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
					{
						Path: compose.FieldPath{"deepseek_output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: deepseekNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
					{
						Path: compose.FieldPath{"deepseek_reasoning"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: deepseekNode.Key,
								FromPath:    compose.FieldPath{"reasoning_content"},
							},
						},
					},
					{
						Path: compose.FieldPath{"inputObj"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entryN.Key,
								FromPath:    compose.FieldPath{"inputObj"},
							},
						},
					},
					{
						Path: compose.FieldPath{"input2"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entryN.Key,
								FromPath:    compose.FieldPath{"input2"},
							},
						},
					},
				},
			}

			exitN := &schema2.NodeSchema{
				Key:  entity.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: &exit.Config{
					TerminatePlan: vo.UseAnswerContent,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"openai_output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: openaiNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
					{
						Path: compose.FieldPath{"deepseek_output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: deepseekNode.Key,
								FromPath:    compose.FieldPath{"output"},
							},
						},
					},
					{
						Path: compose.FieldPath{"deepseek_reasoning"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: deepseekNode.Key,
								FromPath:    compose.FieldPath{"reasoning_content"},
							},
						},
					},
				},
			}

			ws := &schema2.WorkflowSchema{
				Nodes: []*schema2.NodeSchema{
					entryN,
					openaiNode,
					deepseekNode,
					emitterNode,
					exitN,
				},
				Connections: []*schema2.Connection{
					{
						FromNode: entryN.Key,
						ToNode:   openaiNode.Key,
					},
					{
						FromNode: openaiNode.Key,
						ToNode:   emitterNode.Key,
					},
					{
						FromNode: entryN.Key,
						ToNode:   deepseekNode.Key,
					},
					{
						FromNode: deepseekNode.Key,
						ToNode:   emitterNode.Key,
					},
					{
						FromNode: emitterNode.Key,
						ToNode:   exitN.Key,
					},
				},
			}

			ws.Init()

			wf, err := compose2.NewWorkflow(ctx, ws)
			if err != nil {
				t.Fatal(err)
			}

			var fullOutput string

			cbHandler := callbacks.NewHandlerBuilder().OnEndWithStreamOutputFn(
				func(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
					defer output.Close()

					for {
						chunk, e := output.Recv()
						if e != nil {
							if e == io.EOF {
								break
							}
							assert.NoError(t, e)
						}

						s, ok := chunk.(*nodes.StructuredCallbackOutput)
						assert.True(t, ok)

						out := s.Output["output"].(string)
						if out != nodes.KeyIsFinished {
							fmt.Print(s.Output["output"])
							fullOutput += s.Output["output"].(string)
						}
					}

					return ctx
				}).Build()

			outStream, err := wf.Runner.Stream(ctx, map[string]any{
				"inputObj": map[string]any{
					"field1": "field1",
					"field2": 1.1,
				},
				"input2": 23.5,
			}, compose.WithCallbacks(cbHandler).DesignateNode(string(emitterNode.Key)))
			assert.NoError(t, err)
			assert.True(t, strings.HasPrefix(fullOutput, "prefix field1 23.5"))
			assert.True(t, strings.HasSuffix(fullOutput, "1.1 suffix"))
			outStream.Close()
		})
	})
}
