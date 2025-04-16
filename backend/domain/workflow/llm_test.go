package workflow

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/callbacks"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	schema2 "github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/emitter"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func TestLLM(t *testing.T) {
	accessKey := os.Getenv("OPENAI_API_KEY")
	baseURL := os.Getenv("OPENAI_BASE_URL")
	modelName := os.Getenv("OPENAI_MODEL_NAME")
	var (
		openaiModel, deepSeekModel model2.ChatModel
		err                        error
	)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockModelManager := mockmodel.NewMockManager(ctrl)
	model.ManagerImpl = mockModelManager
	defer func() {
		model.ManagerImpl = nil
	}()

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

	mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.ChatModel, error) {
		if params.ModelName == modelName {
			return openaiModel, nil
		} else if params.ModelName == deepSeekModelName {
			return deepSeekModel, nil
		} else {
			return nil, fmt.Errorf("invalid model name: %s", params.ModelName)
		}
	}).AnyTimes()

	t.Run("plain text output, non-streaming mode", func(t *testing.T) {
		if openaiModel == nil {
			defer func() {
				openaiModel = nil
			}()
			openaiModel = &utChatModel{
				invokeResultProvider: func() (*schema2.Message, error) {
					return &schema2.Message{
						Role:    schema2.Assistant,
						Content: "I don't know",
					}, nil
				},
			}
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		llmNode := &schema.NodeSchema{
			Key:  "llm_node_key",
			Type: schema.NodeTypeLLM,
			Configs: map[string]any{
				"SystemPrompt": "{{sys_prompt}}",
				"UserPrompt":   "{{query}}",
				"OutputFormat": llm.FormatText,
				"LLMParams": &model.LLMParams{
					ModelName: modelName,
				},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"sys_prompt"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"sys_prompt"},
						},
					},
				},
				{
					Path: compose.FieldPath{"query"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"query"},
						},
					},
				},
			},
			OutputTypes: map[string]*nodes.TypeInfo{
				"output": {
					Type: nodes.DataTypeString,
				},
			},
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: llmNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   llmNode.Key,
				},
				{
					FromNode: llmNode.Key,
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		err = wf.AddNode(ctx, llmNode)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, exit)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, entry)
		assert.NoError(t, err)

		r, err := wf.Compile(ctx)
		assert.NoError(t, err)

		out, err := r.Invoke(ctx, map[string]any{
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
			openaiModel = &utChatModel{
				invokeResultProvider: func() (*schema2.Message, error) {
					return &schema2.Message{
						Role:    schema2.Assistant,
						Content: `{"country_name": "Russia", "area_size": 17075400}`,
					}, nil
				},
			}
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		llmNode := &schema.NodeSchema{
			Key:  "llm_node_key",
			Type: schema.NodeTypeLLM,
			Configs: map[string]any{
				"SystemPrompt":    "you are a helpful assistant",
				"UserPrompt":      "what's the largest country in the world and it's area size in square kilometers?",
				"OutputFormat":    llm.FormatJSON,
				"IgnoreException": true,
				"DefaultOutput": map[string]any{
					"country_name": "unknown",
					"area_size":    int64(0),
				},
				"LLMParams": &model.LLMParams{
					ModelName: modelName,
				},
			},
			OutputTypes: map[string]*nodes.TypeInfo{
				"country_name": {
					Type:     nodes.DataTypeString,
					Required: true,
				},
				"area_size": {
					Type:     nodes.DataTypeInteger,
					Required: true,
				},
			},
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"country_name"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: llmNode.Key,
							FromPath:    compose.FieldPath{"country_name"},
						},
					},
				},
				{
					Path: compose.FieldPath{"area_size"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: llmNode.Key,
							FromPath:    compose.FieldPath{"area_size"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   llmNode.Key,
				},
				{
					FromNode: llmNode.Key,
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		err = wf.AddNode(ctx, llmNode)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, exit)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, entry)
		assert.NoError(t, err)

		r, err := wf.Compile(ctx)
		assert.NoError(t, err)

		out, err := r.Invoke(ctx, map[string]any{})
		assert.NoError(t, err)

		assert.Equal(t, out["country_name"], "Russia")
		assert.Greater(t, out["area_size"], int64(1000))
	})

	t.Run("markdown output", func(t *testing.T) {
		if openaiModel == nil {
			defer func() {
				openaiModel = nil
			}()
			openaiModel = &utChatModel{
				invokeResultProvider: func() (*schema2.Message, error) {
					return &schema2.Message{
						Role:    schema2.Assistant,
						Content: `#Top 5 Largest Countries in the World ## 1. Russia 2. Canada 3. United States 4. Brazil 5. Japan`,
					}, nil
				},
			}
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		llmNode := &schema.NodeSchema{
			Key:  "llm_node_key",
			Type: schema.NodeTypeLLM,
			Configs: map[string]any{
				"SystemPrompt": "you are a helpful assistant",
				"UserPrompt":   "list the top 5 largest countries in the world",
				"OutputFormat": llm.FormatMarkdown,
				"LLMParams": &model.LLMParams{
					ModelName: modelName,
				},
			},
			OutputTypes: map[string]*nodes.TypeInfo{
				"output": {
					Type: nodes.DataTypeString,
				},
			},
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: llmNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   llmNode.Key,
				},
				{
					FromNode: llmNode.Key,
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		err = wf.AddNode(ctx, llmNode)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, exit)
		assert.NoError(t, err)
		err = wf.AddNode(ctx, entry)
		assert.NoError(t, err)

		r, err := wf.Compile(ctx)
		assert.NoError(t, err)

		out, err := r.Invoke(ctx, map[string]any{})
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
				openaiModel = &utChatModel{
					streamResultProvider: func() (*schema2.StreamReader[*schema2.Message], error) {
						sr := schema2.StreamReaderFromArray([]*schema2.Message{
							{
								Role:    schema2.Assistant,
								Content: "I ",
							},
							{
								Role:    schema2.Assistant,
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
				deepSeekModel = &utChatModel{
					streamResultProvider: func() (*schema2.StreamReader[*schema2.Message], error) {
						sr := schema2.StreamReaderFromArray([]*schema2.Message{
							{
								Role:    schema2.Assistant,
								Content: "I ",
							},
							{
								Role:    schema2.Assistant,
								Content: "don't know too.",
							},
						})
						return sr, nil
					},
				}
			}
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		openaiNode := &schema.NodeSchema{
			Key:  "openai_llm_node_key",
			Type: schema.NodeTypeLLM,
			Configs: map[string]any{
				"SystemPrompt": "you are a helpful assistant",
				"UserPrompt":   "plan a 10 day family visit to China.",
				"OutputFormat": llm.FormatText,
				"LLMParams": &model.LLMParams{
					ModelName: modelName,
				},
			},
			OutputTypes: map[string]*nodes.TypeInfo{
				"output": {
					Type: nodes.DataTypeString,
				},
			},
		}

		deepseekNode := &schema.NodeSchema{
			Key:  "deepseek_llm_node_key",
			Type: schema.NodeTypeLLM,
			Configs: map[string]any{
				"SystemPrompt": "you are a helpful assistant",
				"UserPrompt":   "thoroughly plan a 10 day family visit to China. Use your reasoning ability.",
				"OutputFormat": llm.FormatText,
				"LLMParams": &model.LLMParams{
					ModelName: modelName,
				},
			},
			OutputTypes: map[string]*nodes.TypeInfo{
				"output": {
					Type: nodes.DataTypeString,
				},
				"reasoning_content": {
					Type: nodes.DataTypeString,
				},
			},
		}

		emitterNode := &schema.NodeSchema{
			Key:  "emitter_node_key",
			Type: schema.NodeTypeOutputEmitter,
			Configs: map[string]any{
				"Template": "prefix {{inputObj.field1}} {{input2}} {{deepseek_reasoning}} \n\n###\n\n {{openai_output}} \n\n###\n\n {{deepseek_output}} suffix",
				"Mode":     emitter.Streaming,
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"openai_output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: openaiNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
				{
					Path: compose.FieldPath{"deepseek_output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: deepseekNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
				{
					Path: compose.FieldPath{"deepseek_reasoning"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: deepseekNode.Key,
							FromPath:    compose.FieldPath{"reasoning_content"},
						},
					},
				},
				{
					Path: compose.FieldPath{"inputObj"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"inputObj"},
						},
					},
				},
				{
					Path: compose.FieldPath{"input2"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"input2"},
						},
					},
				},
			},
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"openai_output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: openaiNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
				{
					Path: compose.FieldPath{"deepseek_output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: deepseekNode.Key,
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
				{
					Path: compose.FieldPath{"deepseek_reasoning"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: deepseekNode.Key,
							FromPath:    compose.FieldPath{"reasoning_content"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				openaiNode,
				deepseekNode,
				emitterNode,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   openaiNode.Key,
				},
				{
					FromNode: openaiNode.Key,
					ToNode:   emitterNode.Key,
				},
				{
					FromNode: entry.Key,
					ToNode:   deepseekNode.Key,
				},
				{
					FromNode: deepseekNode.Key,
					ToNode:   emitterNode.Key,
				},
				{
					FromNode: emitterNode.Key,
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		wf, err := NewWorkflow(ctx, ws)
		if err != nil {
			t.Fatal(err)
		}

		var fullOutput string

		cbHandler := callbacks.NewHandlerBuilder().OnEndWithStreamOutputFn(
			func(ctx context.Context, info *callbacks.RunInfo, output *schema2.StreamReader[callbacks.CallbackOutput]) context.Context {
				defer output.Close()

				for {
					chunk, e := output.Recv()
					if e != nil {
						if e == io.EOF {
							break
						}
						assert.NoError(t, e)
					}

					s, ok := chunk.(string)
					assert.True(t, ok)

					fmt.Print(s)
					fullOutput += s
				}

				return ctx
			}).Build()

		outStream, err := wf.runner.Stream(ctx, map[string]any{
			"inputObj": map[string]any{
				"field1": "field1",
			},
			"input2": 23.5,
		}, compose.WithCallbacks(cbHandler).DesignateNode(string(emitterNode.Key)))
		assert.NoError(t, err)
		assert.True(t, strings.HasPrefix(fullOutput, "prefix field1 23.5"))
		assert.True(t, strings.HasSuffix(fullOutput, "suffix"))
		outStream.Close()
	})
}
