package agent

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/stretchr/testify/require"
)

func TestMergeConfigQueryFromCompositeInput(t *testing.T) {
	a := &Agent{
		baseConfig: &Config{
			Inputs: make(map[string]string),
		},
	}

	cfg := a.mergeConfig(context.Background(), map[string]any{
		"inputs": map[string]any{
			"query": map[string]any{
				"value": map[string]any{
					"content": "hello literal",
				},
			},
		},
	})

	require.Equal(t, "hello literal", cfg.Query)
	require.Equal(t, "hello literal", cfg.Inputs["query"])
}

func TestMergeConfigQueryFromUserMessage(t *testing.T) {
	original := getExeCtx
	defer func() {
		getExeCtx = original
	}()
	getExeCtx = func(context.Context) *execute.Context {
		return &execute.Context{
			RootCtx: execute.RootCtx{
				ExeCfg: workflowModel.ExecuteConfig{
					UserMessage: &schema.Message{Content: " hi there "},
				},
			},
		}
	}

	a := &Agent{
		baseConfig: &Config{
			Inputs: make(map[string]string),
			AssociateStartNodeUserInputFields: map[string]struct{}{
				"query": {},
			},
		},
	}

	cfg := a.mergeConfig(context.Background(), map[string]any{})

	require.Contains(t, cfg.AssociateStartNodeUserInputFields, "query")

	require.Equal(t, "hi there", cfg.Query)
	require.Equal(t, "hi there", cfg.Inputs["query"])
}

func TestConfigAdaptRegistersQueryInput(t *testing.T) {
	cfg := NewConfig()
	node := &vo.Node{
		ID:   "agent-node",
		Type: entity.NodeTypeAgent.IDStr(),
		Data: &vo.Data{
			Inputs: &vo.Inputs{
				Agent: &vo.Agent{
					Query: &vo.BlockInput{
						Type: vo.VariableTypeString,
						Value: &vo.BlockInputValue{
							Type: vo.BlockInputValueTypeRef,
							Content: &vo.BlockInputReference{
								BlockID: "prev-node",
								Name:    "output",
								Source:  vo.RefSourceTypeBlockOutput,
							},
						},
					},
				},
			},
		},
	}

	ns, err := cfg.Adapt(context.Background(), node)
	require.NoError(t, err)

	queryType, ok := ns.InputTypes["query"]
	require.True(t, ok)
	require.Equal(t, vo.DataTypeString, queryType.Type)

	found := false
	for _, info := range ns.InputSources {
		if len(info.Path) == 1 && info.Path[0] == "query" {
			require.NotNil(t, info.Source.Ref)
			require.Equal(t, vo.NodeKey("prev-node"), info.Source.Ref.FromNodeKey)
			require.Equal(t, compose.FieldPath{"output"}, info.Source.Ref.FromPath)
			found = true
			break
		}
	}

	require.True(t, found)
}

func TestMergeConfigIncludesDynamicParameters(t *testing.T) {
	a := &Agent{
		baseConfig: &Config{
			Inputs: make(map[string]string),
		},
	}

	cfg := a.mergeConfig(context.Background(), map[string]any{
		"city":          "Tokyo",
		"score":         42,
		"dynamicInputs": []any{"foo"},
	})

	require.Equal(t, "Tokyo", cfg.Inputs["city"])
	require.Equal(t, "42", cfg.Inputs["score"])
	_, exists := cfg.Inputs["dynamicInputs"]
	require.False(t, exists)
}

func TestMergeConfigDynamicInputsSlice(t *testing.T) {
	a := &Agent{
		baseConfig: &Config{
			Inputs: make(map[string]string),
		},
	}

	cfg := a.mergeConfig(context.Background(), map[string]any{
		"inputs": map[string]any{
			"dynamicInputs": []any{
				map[string]any{
					"name":  "global_param_loginStatus",
					"value": map[string]any{"content": "1"},
				},
			},
		},
	})

	require.Equal(t, "1", cfg.Inputs["global_param_loginStatus"])
}

func TestMergeConfigDynamicInputsMap(t *testing.T) {
	a := &Agent{
		baseConfig: &Config{
			Inputs: make(map[string]string),
		},
	}

	cfg := a.mergeConfig(context.Background(), map[string]any{
		"inputs": map[string]any{
			"dynamicInputs": map[string]any{
				"global_param_loginStatus": map[string]any{
					"resolved": "logged-in",
				},
			},
		},
	})

	require.Equal(t, "logged-in", cfg.Inputs["global_param_loginStatus"])
}
