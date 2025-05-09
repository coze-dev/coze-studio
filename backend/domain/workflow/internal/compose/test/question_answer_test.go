package test

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino-ext/components/model/openai"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	compose2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	repo2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/internal/testutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestQuestionAnswer(t *testing.T) {
	mockey.PatchConvey("test qa", t, func() {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		accessKey := os.Getenv("OPENAI_API_KEY")
		baseURL := os.Getenv("OPENAI_BASE_URL")
		modelName := os.Getenv("OPENAI_MODEL_NAME")
		var (
			chatModel model2.BaseChatModel
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

		dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
		if os.Getenv("CI_JOB_NAME") != "" {
			dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
		}
		db, err := gorm.Open(mysql.Open(dsn))
		assert.NoError(t, err)

		s, err := miniredis.Run()
		if err != nil {
			t.Fatalf("Failed to start miniredis: %v", err)
		}
		defer s.Close()

		redisClient := redis.NewClient(&redis.Options{
			Addr: s.Addr(),
		})

		mockIDGen := mock.NewMockIDGenerator(ctrl)
		mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()

		repo := repo2.NewRepository(mockIDGen, db, redisClient)
		mockey.Mock(workflow.GetRepository).Return(repo).Build()

		t.Run("answer directly, no structured output", func(t *testing.T) {
			entry := &compose2.NodeSchema{
				Key:  compose2.EntryNodeKey,
				Type: entity.NodeTypeEntry,
			}

			ns := &compose2.NodeSchema{
				Key:  "qa_node_key",
				Type: entity.NodeTypeQuestionAnswer,
				Configs: map[string]any{
					"QuestionTpl": "{{input}}",
					"AnswerType":  qa.AnswerDirectly,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"input"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
				},
			}

			exit := &compose2.NodeSchema{
				Key:  compose2.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: map[string]any{
					"TerminalPlan": vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"answer"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.UserResponseKey},
							},
						},
					},
				},
			}

			ws := &compose2.WorkflowSchema{
				Nodes: []*compose2.NodeSchema{
					entry,
					ns,
					exit,
				},
				Connections: []*compose2.Connection{
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

			wf, err := compose2.NewWorkflow(context.Background(), ws)
			assert.NoError(t, err)

			checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
			_, err = wf.Runner.Invoke(context.Background(), map[string]any{
				"query": "what's your name?",
			}, compose.WithCheckPointID(checkPointID))
			assert.Error(t, err)

			info, existed := compose.ExtractInterruptInfo(err)
			assert.True(t, existed)
			assert.Equal(t, "what's your name?", info.State.(*compose2.State).Questions[ns.Key][0].Question)

			answer := "my name is eino"
			stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
				state.(*compose2.State).Answers[ns.Key] = append(state.(*compose2.State).Answers[ns.Key], answer)
				return nil
			}
			out, err := wf.Runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"answer": answer,
			}, out)
		})

		t.Run("answer with fixed choices", func(t *testing.T) {
			if chatModel == nil {
				oneChatModel := &testutil.UTChatModel{
					InvokeResultProvider: func() (*schema.Message, error) {
						return &schema.Message{
							Role:    schema.Assistant,
							Content: "-1",
						}, nil
					},
				}
				mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(oneChatModel, nil).Times(1)
			}

			entry := &compose2.NodeSchema{
				Key:  compose2.EntryNodeKey,
				Type: entity.NodeTypeEntry,
			}

			ns := &compose2.NodeSchema{
				Key:  "qa_node_key",
				Type: entity.NodeTypeQuestionAnswer,
				Configs: map[string]any{
					"QuestionTpl":  "{{input}}",
					"AnswerType":   qa.AnswerByChoices,
					"ChoiceType":   qa.FixedChoices,
					"FixedChoices": []string{"{{choice1}}", "{{choice2}}"},
					"LLMParams":    &model.LLMParams{},
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"input"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
					{
						Path: compose.FieldPath{"choice1"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"choice1"},
							},
						},
					},
					{
						Path: compose.FieldPath{"choice2"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"choice2"},
							},
						},
					},
				},
			}

			exit := &compose2.NodeSchema{
				Key:  compose2.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: map[string]any{
					"TerminalPlan": vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"option_id"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.OptionIDKey},
							},
						},
					},
					{
						Path: compose.FieldPath{"option_content"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.OptionContentKey},
							},
						},
					},
				},
			}

			lambda := &compose2.NodeSchema{
				Key:  "lambda",
				Type: entity.NodeTypeLambda,
				Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
					return out, nil
				}),
			}

			ws := &compose2.WorkflowSchema{
				Nodes: []*compose2.NodeSchema{
					entry,
					ns,
					exit,
					lambda,
				},
				Connections: []*compose2.Connection{
					{
						FromNode: entry.Key,
						ToNode:   "qa_node_key",
					},
					{
						FromNode:   "qa_node_key",
						ToNode:     exit.Key,
						FromPort:   ptr.Of("branch_0"),
						FromBranch: true,
					},
					{
						FromNode:   "qa_node_key",
						ToNode:     exit.Key,
						FromPort:   ptr.Of("branch_1"),
						FromBranch: true,
					},
					{
						FromNode:   "qa_node_key",
						ToNode:     "lambda",
						FromPort:   ptr.Of("default"),
						FromBranch: true,
					},
					{
						FromNode: "lambda",
						ToNode:   exit.Key,
					},
				},
			}

			wf, err := compose2.NewWorkflow(context.Background(), ws)
			assert.NoError(t, err)

			checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
			_, err = wf.Runner.Invoke(context.Background(), map[string]any{
				"query":   "what's would you make in Coze?",
				"choice1": "make agent",
				"choice2": "make workflow",
			}, compose.WithCheckPointID(checkPointID))
			assert.Error(t, err)

			info, existed := compose.ExtractInterruptInfo(err)
			assert.True(t, existed)
			assert.Equal(t, "what's would you make in Coze?", info.State.(*compose2.State).Questions[ns.Key][0].Question)
			assert.Equal(t, "make agent", info.State.(*compose2.State).Questions[ns.Key][0].Choices[0])
			assert.Equal(t, "make workflow", info.State.(*compose2.State).Questions[ns.Key][0].Choices[1])

			chosenContent := "I would make all kinds of stuff"
			stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
				state.(*compose2.State).Answers[ns.Key] = append(state.(*compose2.State).Answers[ns.Key], chosenContent)
				return nil
			}
			out, err := wf.Runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"option_id":      "other",
				"option_content": chosenContent,
			}, out)
		})

		t.Run("answer with dynamic choices", func(t *testing.T) {
			entry := &compose2.NodeSchema{
				Key:  compose2.EntryNodeKey,
				Type: entity.NodeTypeEntry,
			}

			ns := &compose2.NodeSchema{
				Key:  "qa_node_key",
				Type: entity.NodeTypeQuestionAnswer,
				Configs: map[string]any{
					"QuestionTpl": "{{input}}",
					"AnswerType":  qa.AnswerByChoices,
					"ChoiceType":  qa.DynamicChoices,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"input"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
					{
						Path: compose.FieldPath{qa.DynamicChoicesKey},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"choices"},
							},
						},
					},
				},
			}

			exit := &compose2.NodeSchema{
				Key:  compose2.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: map[string]any{
					"TerminalPlan": vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"option_id"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.OptionIDKey},
							},
						},
					},
					{
						Path: compose.FieldPath{"option_content"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.OptionContentKey},
							},
						},
					},
				},
			}

			lambda := &compose2.NodeSchema{
				Key:  "lambda",
				Type: entity.NodeTypeLambda,
				Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
					return out, nil
				}),
			}

			ws := &compose2.WorkflowSchema{
				Nodes: []*compose2.NodeSchema{
					entry,
					ns,
					exit,
					lambda,
				},
				Connections: []*compose2.Connection{
					{
						FromNode: entry.Key,
						ToNode:   "qa_node_key",
					},
					{
						FromNode:   "qa_node_key",
						ToNode:     exit.Key,
						FromPort:   ptr.Of("branch_0"),
						FromBranch: true,
					},
					{
						FromNode: "lambda",
						ToNode:   exit.Key,
					},
					{
						FromNode:   "qa_node_key",
						ToNode:     "lambda",
						FromPort:   ptr.Of("default"),
						FromBranch: true,
					},
				},
			}

			wf, err := compose2.NewWorkflow(context.Background(), ws)
			assert.NoError(t, err)

			checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
			_, err = wf.Runner.Invoke(context.Background(), map[string]any{
				"query":   "what's the capital city of China?",
				"choices": []any{"beijing", "shanghai"},
			}, compose.WithCheckPointID(checkPointID))
			assert.Error(t, err)

			info, existed := compose.ExtractInterruptInfo(err)
			assert.True(t, existed)
			assert.Equal(t, "what's the capital city of China?", info.State.(*compose2.State).Questions[ns.Key][0].Question)
			assert.Equal(t, "beijing", info.State.(*compose2.State).Questions[ns.Key][0].Choices[0])
			assert.Equal(t, "shanghai", info.State.(*compose2.State).Questions[ns.Key][0].Choices[1])

			chosenContent := "beijing"
			stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
				state.(*compose2.State).Answers[ns.Key] = append(state.(*compose2.State).Answers[ns.Key], chosenContent)
				return nil
			}
			out, err := wf.Runner.Invoke(context.Background(), nil, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
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
				chatModel = &testutil.UTChatModel{
					InvokeResultProvider: func() (*schema.Message, error) {
						if qaCount == 1 {
							return &schema.Message{
								Role:    schema.Assistant,
								Content: `{"question": "what's your age?"}`,
							}, nil
						} else if qaCount == 2 {
							return &schema.Message{
								Role:    schema.Assistant,
								Content: `{"fields": {"name": "eino", "age": 1}}`,
							}, nil
						}
						return nil, errors.New("not found")
					},
				}
				mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).Times(1)
			}

			entry := &compose2.NodeSchema{
				Key:  compose2.EntryNodeKey,
				Type: entity.NodeTypeEntry,
			}

			ns := &compose2.NodeSchema{
				Key:  "qa_node_key",
				Type: entity.NodeTypeQuestionAnswer,
				Configs: map[string]any{
					"QuestionTpl":               "{{input}}",
					"AnswerType":                qa.AnswerDirectly,
					"ExtractFromAnswer":         true,
					"AdditionalSystemPromptTpl": "{{prompt}}",
					"MaxAnswerCount":            2,
					"LLMParams":                 &model.LLMParams{},
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"input"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"query"},
							},
						},
					},
					{
						Path: compose.FieldPath{"prompt"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: entry.Key,
								FromPath:    compose.FieldPath{"prompt"},
							},
						},
					},
				},
				OutputTypes: map[string]*vo.TypeInfo{
					"name": {
						Type:     vo.DataTypeString,
						Required: true,
					},
					"age": {
						Type:     vo.DataTypeInteger,
						Required: true,
					},
				},
			}

			exit := &compose2.NodeSchema{
				Key:  compose2.ExitNodeKey,
				Type: entity.NodeTypeExit,
				Configs: map[string]any{
					"TerminalPlan": vo.ReturnVariables,
				},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"name"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{"name"},
							},
						},
					},
					{
						Path: compose.FieldPath{"age"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{"age"},
							},
						},
					},
					{
						Path: compose.FieldPath{qa.UserResponseKey},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "qa_node_key",
								FromPath:    compose.FieldPath{qa.UserResponseKey},
							},
						},
					},
				},
			}

			ws := &compose2.WorkflowSchema{
				Nodes: []*compose2.NodeSchema{
					entry,
					ns,
					exit,
				},
				Connections: []*compose2.Connection{
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

			wf, err := compose2.NewWorkflow(context.Background(), ws)
			assert.NoError(t, err)

			checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
			_, err = wf.Runner.Invoke(ctx, map[string]any{
				"query":  "what's your name?",
				"prompt": "You are a helpful assistant.",
			}, compose.WithCheckPointID(checkPointID))
			assert.Error(t, err)

			info, existed := compose.ExtractInterruptInfo(err)
			assert.True(t, existed)
			assert.Equal(t, "what's your name?", info.State.(*compose2.State).Questions["qa_node_key"][0].Question)

			qaCount++
			answer := "my name is eino"
			stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
				state.(*compose2.State).Answers[ns.Key] = append(state.(*compose2.State).Answers[ns.Key], answer)
				return nil
			}
			_, err = wf.Runner.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
			assert.Error(t, err)
			info, existed = compose.ExtractInterruptInfo(err)
			assert.True(t, existed)

			qaCount++
			answer = "my age is 1 years old"
			stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
				state.(*compose2.State).Answers[ns.Key] = append(state.(*compose2.State).Answers[ns.Key], answer)
				return nil
			}
			out, err := wf.Runner.Invoke(ctx, map[string]any{}, compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				qa.UserResponseKey: answer,
				"name":             "eino",
				"age":              int64(1),
			}, out)
		})
	})
}
