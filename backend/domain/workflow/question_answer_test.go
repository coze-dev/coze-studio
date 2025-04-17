package workflow

import (
	"context"
	"errors"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/cloudwego/eino-ext/components/model/openai"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	schema2 "github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

type utChatModel struct {
	invokeResultProvider func() (*schema2.Message, error)
	streamResultProvider func() (*schema2.StreamReader[*schema2.Message], error)
}

func (q *utChatModel) Generate(_ context.Context, _ []*schema2.Message, _ ...model2.Option) (*schema2.Message, error) {
	return q.invokeResultProvider()
}

func (q *utChatModel) Stream(_ context.Context, _ []*schema2.Message, _ ...model2.Option) (*schema2.StreamReader[*schema2.Message], error) {
	return q.streamResultProvider()
}

func (q *utChatModel) BindTools(_ []*schema2.ToolInfo) error {
	return nil
}

func TestQuestionAnswer(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockModelManager := mockmodel.NewMockManager(ctrl)
	model.ManagerImpl = mockModelManager
	defer func() {
		model.ManagerImpl = nil
	}()

	accessKey := os.Getenv("OPENAI_API_KEY")
	baseURL := os.Getenv("OPENAI_BASE_URL")
	modelName := os.Getenv("OPENAI_MODEL_NAME")
	var (
		chatModel model2.ChatModel
		err       error
	)

	if len(accessKey) > 0 && len(baseURL) > 0 && len(modelName) > 0 {
		chatModel, err = openai.NewChatModel(context.Background(), &openai.ChatModelConfig{
			APIKey:  accessKey,
			ByAzure: true,
			BaseURL: baseURL,
			Model:   modelName,
		})
		assert.NoError(t, err)

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()
	}

	t.Run("answer directly, no structured output", func(t *testing.T) {
		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl": "{{input}}",
				"AnswerType":  qa.AnswerDirectly,
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"input"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"query"},
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
					Path: compose.FieldPath{"answer"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.UserResponseKey},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				ns,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "qa_node_key",
				},
				{
					FromNode: "qa_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
		_, err = wf.runner.Invoke(context.Background(), map[string]any{
			"query": "what's your name?",
		}, compose.WithCheckPointID(checkPointID))
		assert.Error(t, err)

		info, existed := compose.ExtractInterruptInfo(err)
		assert.True(t, existed)
		assert.Equal(t, "what's your name?", info.State.(*schema.State).Questions[ns.Key][0].Question)

		answer := "my name is eino"
		stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], answer)
			return nil
		}
		out, err := wf.runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"answer": answer,
		}, out)
	})

	t.Run("answer with fixed choices", func(t *testing.T) {
		if chatModel == nil {
			oneChatModel := &utChatModel{
				invokeResultProvider: func() (*schema2.Message, error) {
					return &schema2.Message{
						Role:    schema2.Assistant,
						Content: "-1",
					}, nil
				},
			}
			mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(oneChatModel, nil).Times(1)
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl":  "{{input}}",
				"AnswerType":   qa.AnswerByChoices,
				"ChoiceType":   qa.FixedChoices,
				"FixedChoices": []string{"{{choice1}}", "{{choice2}}"},
				"LLMParams":    &model.LLMParams{},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"input"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"query"},
						},
					},
				},
				{
					Path: compose.FieldPath{"choice1"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"choice1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"choice2"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"choice2"},
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
					Path: compose.FieldPath{"option_id"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionIDKey},
						},
					},
				},
				{
					Path: compose.FieldPath{"option_content"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionContentKey},
						},
					},
				},
			},
		}

		lambda := &schema.NodeSchema{
			Key:  "lambda",
			Type: schema.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				return out, nil
			}),
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				ns,
				exit,
				lambda,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "qa_node_key",
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     exit.Key,
					FromPort:   ptrOf("branch_0"),
					FromBranch: true,
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     exit.Key,
					FromPort:   ptrOf("branch_1"),
					FromBranch: true,
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     "lambda",
					FromPort:   ptrOf("default"),
					FromBranch: true,
				},
				{
					FromNode: "lambda",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
		_, err = wf.runner.Invoke(context.Background(), map[string]any{
			"query":   "what's would you make in Coze?",
			"choice1": "make agent",
			"choice2": "make workflow",
		}, compose.WithCheckPointID(checkPointID))
		assert.Error(t, err)

		info, existed := compose.ExtractInterruptInfo(err)
		assert.True(t, existed)
		assert.Equal(t, "what's would you make in Coze?", info.State.(*schema.State).Questions[ns.Key][0].Question)
		assert.Equal(t, "make agent", info.State.(*schema.State).Questions[ns.Key][0].Choices[0])
		assert.Equal(t, "make workflow", info.State.(*schema.State).Questions[ns.Key][0].Choices[1])

		chosenContent := "I would make all kinds of stuff"
		stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], chosenContent)
			return nil
		}
		out, err := wf.runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"option_id":      "other",
			"option_content": chosenContent,
		}, out)
	})

	t.Run("answer with dynamic choices", func(t *testing.T) {
		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl": "{{input}}",
				"AnswerType":  qa.AnswerByChoices,
				"ChoiceType":  qa.DynamicChoices,
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"input"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"query"},
						},
					},
				},
				{
					Path: compose.FieldPath{qa.DynamicChoicesKey},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"choices"},
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
					Path: compose.FieldPath{"option_id"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionIDKey},
						},
					},
				},
				{
					Path: compose.FieldPath{"option_content"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionContentKey},
						},
					},
				},
			},
		}

		lambda := &schema.NodeSchema{
			Key:  "lambda",
			Type: schema.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				return out, nil
			}),
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				ns,
				exit,
				lambda,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "qa_node_key",
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     exit.Key,
					FromPort:   ptrOf("branch_0"),
					FromBranch: true,
				},
				{
					FromNode: "lambda",
					ToNode:   exit.Key,
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     "lambda",
					FromPort:   ptrOf("default"),
					FromBranch: true,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
		_, err = wf.runner.Invoke(context.Background(), map[string]any{
			"query":   "what's the capital city of China?",
			"choices": []any{"beijing", "shanghai"},
		}, compose.WithCheckPointID(checkPointID))
		assert.Error(t, err)

		info, existed := compose.ExtractInterruptInfo(err)
		assert.True(t, existed)
		assert.Equal(t, "what's the capital city of China?", info.State.(*schema.State).Questions[ns.Key][0].Question)
		assert.Equal(t, "beijing", info.State.(*schema.State).Questions[ns.Key][0].Choices[0])
		assert.Equal(t, "shanghai", info.State.(*schema.State).Questions[ns.Key][0].Choices[1])

		chosenContent := "beijing"
		stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], chosenContent)
			return nil
		}
		out, err := wf.runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"option_id":      "A",
			"option_content": chosenContent,
		}, out)
	})

	t.Run("answer directly, extract structured output", func(t *testing.T) {
		ctx := context.Background()
		qaCount := 0
		if chatModel == nil {
			defer func() {
				chatModel = nil
			}()
			chatModel = &utChatModel{
				invokeResultProvider: func() (*schema2.Message, error) {
					if qaCount == 1 {
						return &schema2.Message{
							Role:    schema2.Assistant,
							Content: `{"question": "what's your age?"}`,
						}, nil
					} else if qaCount == 2 {
						return &schema2.Message{
							Role:    schema2.Assistant,
							Content: `{"fields": {"name": "eino", "age": 1}}`,
						}, nil
					}
					return nil, errors.New("not found")
				},
			}
			mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).Times(1)
		}

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl":               "{{input}}",
				"AnswerType":                qa.AnswerDirectly,
				"ExtractFromAnswer":         true,
				"AdditionalSystemPromptTpl": "{{prompt}}",
				"MaxAnswerCount":            2,
				"OutputFields": map[string]*nodes.TypeInfo{
					"name": {
						Type:     nodes.DataTypeString,
						Required: true,
					},
					"age": {
						Type:     nodes.DataTypeInteger,
						Required: true,
					},
				},
				"LLMParams": &model.LLMParams{},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"input"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"query"},
						},
					},
				},
				{
					Path: compose.FieldPath{"prompt"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"prompt"},
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
					Path: compose.FieldPath{"name"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{"name"},
						},
					},
				},
				{
					Path: compose.FieldPath{"age"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{"age"},
						},
					},
				},
				{
					Path: compose.FieldPath{qa.UserResponseKey},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.UserResponseKey},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				ns,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "qa_node_key",
				},
				{
					FromNode: "qa_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
		_, err = wf.runner.Invoke(ctx, map[string]any{
			"query":  "what's your name?",
			"prompt": "You are a helpful assistant.",
		}, compose.WithCheckPointID(checkPointID))
		assert.Error(t, err)

		info, existed := compose.ExtractInterruptInfo(err)
		assert.True(t, existed)
		assert.Equal(t, "what's your name?", info.State.(*schema.State).Questions["qa_node_key"][0].Question)

		qaCount++
		answer := "my name is eino"
		stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], answer)
			return nil
		}
		_, err = wf.runner.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.Error(t, err)
		info, existed = compose.ExtractInterruptInfo(err)
		assert.True(t, existed)

		qaCount++
		answer = "my age is 1 years old"
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], answer)
			return nil
		}
		out, err := wf.runner.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			qa.UserResponseKey: answer,
			"name":             "eino",
			"age":              int64(1),
		}, out)
	})
}
