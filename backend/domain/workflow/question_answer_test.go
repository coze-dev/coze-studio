package workflow

import (
	"context"
	"os"
	"testing"

	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
	"code.byted.org/flow/opencoze/backend/domain/workflow/variables"
)

type inMemoryStore struct {
	m map[string][]byte
}

func (i *inMemoryStore) Get(ctx context.Context, checkPointID string) ([]byte, bool, error) {
	v, ok := i.m[checkPointID]
	return v, ok, nil
}

func (i *inMemoryStore) Set(ctx context.Context, checkPointID string, checkPoint []byte) error {
	i.m[checkPointID] = checkPoint
	return nil
}

func newInMemoryStore() *inMemoryStore {
	return &inMemoryStore{
		m: make(map[string][]byte),
	}
}

func TestQuestionAnswer(t *testing.T) {
	err := compose.RegisterSerializableType[*schema.State]("schema_state")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[*variables.VariableHandler]("variable_handler")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[*variables.ParentIntermediateStore]("parent_intermediate_store")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[[]*qa.Question]("qa_question_list")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[qa.Question]("qa_question")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[map[string]any]("map[string]any")
	assert.NoError(t, err)
	err = compose.RegisterSerializableType[[]string]("[]string")
	assert.NoError(t, err)

	accessKey := os.Getenv("OPENAI_API_KEY")
	baseURL := os.Getenv("OPENAI_BASE_URL")
	modelName := os.Getenv("OPENAI_MODEL_NAME")
	var modelMocked bool

	if len(accessKey) > 0 && len(baseURL) > 0 && len(modelName) > 0 {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		model.ManagerImpl = mockModelManager
		defer func() {
			model.ManagerImpl = nil
		}()

		openaiModel, err := openai.NewChatModel(context.Background(), &openai.ChatModelConfig{
			APIKey:  accessKey,
			ByAzure: true,
			BaseURL: baseURL,
			Model:   modelName,
		})
		assert.NoError(t, err)

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(openaiModel, nil).AnyTimes()
		modelMocked = true
	}

	t.Run("answer directly, no structured output", func(t *testing.T) {
		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl": "{{input}}",
				"AnswerType":  qa.AnswerDirectly,
			},
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"input"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(schema.GenState())),
			hierarchy: map[nodeKey][]nodeKey{
				"qa_node_key": {},
			},
			connections: []*connection{
				{
					FromNode: compose.START,
					ToNode:   "qa_node_key",
				},
				{
					FromNode: "qa_node_key",
					ToNode:   compose.END,
				},
			},
		}

		_, err := wf.AddNode(context.Background(), "qa_node_key", ns, nil)
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
			{
				Path: compose.FieldPath{"answer"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.UserResponseKey},
						},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background(), compose.WithCheckPointStore(newInMemoryStore()))
		assert.NoError(t, err)

		checkPointID := "1"
		_, err = r.Invoke(context.Background(), map[string]any{
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
		out, err := r.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"answer": answer,
		}, out)
	})

	t.Run("answer with fixed choices", func(t *testing.T) {
		if !modelMocked {
			t.Skip("model is not mocked, skip this test")
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
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"input"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"choice1"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"choice1"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"choice2"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"choice2"},
							},
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

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(schema.GenState())),
			hierarchy: map[nodeKey][]nodeKey{
				"qa_node_key": {},
				"lambda":      {}},
			connections: []*connection{
				{
					FromNode: compose.START,
					ToNode:   "qa_node_key",
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     compose.END,
					FromPort:   ptrOf("branch_0"),
					FromBranch: true,
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     compose.END,
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
					ToNode:   compose.END,
				}},
		}

		_, err := wf.AddNode(context.Background(), "qa_node_key", ns, nil)
		assert.NoError(t, err)
		_, err = wf.AddNode(context.Background(), "lambda", lambda, nil)
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
			{
				Path: compose.FieldPath{"option_id"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionIDKey},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"option_content"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionContentKey},
						},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background(), compose.WithCheckPointStore(newInMemoryStore()))
		assert.NoError(t, err)

		checkPointID := "1"
		_, err = r.Invoke(context.Background(), map[string]any{
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
		out, err := r.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"option_id":      "other",
			"option_content": chosenContent,
		}, out)
	})

	t.Run("answer with dynamic choices", func(t *testing.T) {
		ns := &schema.NodeSchema{
			Key:  "qa_node_key",
			Type: schema.NodeTypeQuestionAnswer,
			Configs: map[string]any{
				"QuestionTpl": "{{input}}",
				"AnswerType":  qa.AnswerByChoices,
				"ChoiceType":  qa.DynamicChoices,
			},
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"input"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{qa.DynamicChoicesKey},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"choices"},
							},
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

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(schema.GenState())),
			hierarchy: map[nodeKey][]nodeKey{
				"qa_node_key": {},
				"lambda":      {},
			},
			connections: []*connection{
				{
					FromNode: compose.START,
					ToNode:   "qa_node_key",
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     compose.END,
					FromPort:   ptrOf("branch_0"),
					FromBranch: true,
				},
				{
					FromNode: "lambda",
					ToNode:   compose.END,
				},
				{
					FromNode:   "qa_node_key",
					ToNode:     "lambda",
					FromPort:   ptrOf("default"),
					FromBranch: true,
				},
			},
		}

		_, err := wf.AddNode(context.Background(), "qa_node_key", ns, nil)
		assert.NoError(t, err)
		_, err = wf.AddNode(context.Background(), "lambda", lambda, nil)
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
			{
				Path: compose.FieldPath{"option_id"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionIDKey},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"option_content"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.OptionContentKey},
						},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background(), compose.WithCheckPointStore(newInMemoryStore()))
		assert.NoError(t, err)

		checkPointID := "1"
		_, err = r.Invoke(context.Background(), map[string]any{
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
		out, err := r.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"option_id":      "A",
			"option_content": chosenContent,
		}, out)
	})

	t.Run("answer directly, extract structured output", func(t *testing.T) {
		ctx := context.Background()
		if !modelMocked {
			t.Skip("model is not mocked, skip this test")
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
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"input"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"prompt"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: compose.START,
								FromPath:    compose.FieldPath{"prompt"},
							},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(schema.GenState())),
			hierarchy: map[nodeKey][]nodeKey{
				"qa_node_key": {},
			},
			connections: []*connection{
				{
					FromNode: compose.START,
					ToNode:   "qa_node_key",
				},
				{
					FromNode: "qa_node_key",
					ToNode:   compose.END,
				},
			},
		}

		_, err = wf.AddNode(ctx, "qa_node_key", ns, nil)
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
			{
				Path: compose.FieldPath{"name"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{"name"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"age"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{"age"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{qa.UserResponseKey},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "qa_node_key",
							FromPath:    compose.FieldPath{qa.UserResponseKey},
						},
					},
				},
			},
		})
		assert.NoError(t, err)

		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(ctx, compose.WithCheckPointStore(newInMemoryStore()))
		assert.NoError(t, err)

		checkPointID := "1"
		_, err = r.Invoke(ctx, map[string]any{
			"query":  "what's your name?",
			"prompt": "You are a helpful assistant.",
		}, compose.WithCheckPointID(checkPointID))
		assert.Error(t, err)

		info, existed := compose.ExtractInterruptInfo(err)
		assert.True(t, existed)
		assert.Equal(t, "what's your name?", info.State.(*schema.State).Questions["qa_node_key"][0].Question)

		answer := "my name is eino"
		stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], answer)
			return nil
		}
		_, err = r.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.Error(t, err)
		info, existed = compose.ExtractInterruptInfo(err)
		assert.True(t, existed)

		answer = "my age is 1 years old"
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*schema.State).Answers[ns.Key] = append(state.(*schema.State).Answers[ns.Key], answer)
			return nil
		}
		out, err := r.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			qa.UserResponseKey: answer,
			"name":             "eino",
			"age":              int64(1),
		}, out)
	})
}
