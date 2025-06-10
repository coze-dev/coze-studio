package test

import (
	"context"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"go.uber.org/mock/gomock"

	userentity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	mockWorkflow "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/types/consts"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	compose2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestLoop(t *testing.T) {
	t.Run("by iteration", func(t *testing.T) {
		// start-> loop_node_key[innerNode->continue] -> end
		innerNode := &compose2.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
				return map[string]any{"output": index}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"index"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"index"},
						},
					},
				},
			},
		}

		continueNode := &compose2.NodeSchema{
			Key:  "continueNode",
			Type: entity.NodeTypeContinue,
		}

		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		loopNode := &compose2.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.ByIteration,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{loop.Count},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"count"},
						},
					},
				},
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
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
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				continueNode,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode":    "loop_node_key",
				"continueNode": "loop_node_key",
			},
			Connections: []*compose2.Connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "continueNode",
				},
				{
					FromNode: "continueNode",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"count": int64(3),
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0), int64(1), int64(2)},
		}, out)
	})

	t.Run("infinite", func(t *testing.T) {
		// start-> loop_node_key[innerNode->break] -> end
		innerNode := &compose2.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
				return map[string]any{"output": index}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"index"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"index"},
						},
					},
				},
			},
		}

		breakNode := &compose2.NodeSchema{
			Key:  "breakNode",
			Type: entity.NodeTypeBreak,
		}

		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		loopNode := &compose2.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.Infinite,
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
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
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				breakNode,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode": "loop_node_key",
				"breakNode": "loop_node_key",
			},
			Connections: []*compose2.Connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "breakNode",
				},
				{
					FromNode: "breakNode",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0)},
		}, out)
	})

	t.Run("by array", func(t *testing.T) {
		// start-> loop_node_key[innerNode->variable_assign] -> end

		innerNode := &compose2.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				item1 := in["item1"].(string)
				item2 := in["item2"].(string)
				count := in["count"].(int)
				return map[string]any{"total": int(count) + len(item1) + len(item2)}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"item1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"item2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"items2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"count"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromPath:     compose.FieldPath{"count"},
							VariableType: ptr.Of(variable.ParentIntermediate),
						},
					},
				},
			},
		}

		assigner := &compose2.NodeSchema{
			Key:  "assigner",
			Type: entity.NodeTypeVariableAssignerWithinLoop,
			Configs: []*variableassigner.Pair{
				{
					Left: vo.Reference{
						FromPath:     compose.FieldPath{"count"},
						VariableType: ptr.Of(variable.ParentIntermediate),
					},
					Right: compose.FieldPath{"total"},
				},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"total"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"total"},
						},
					},
				},
			},
		}

		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		exit := &compose2.NodeSchema{
			Key:  compose2.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: map[string]any{
				"TerminalPlan": vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		loopNode := &compose2.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.ByArray,
				"IntermediateVars": map[string]*vo.TypeInfo{
					"count": {
						Type: vo.DataTypeInteger,
					},
				},
			},
			InputTypes: map[string]*vo.TypeInfo{
				"items1": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString},
				},
				"items2": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString},
				},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"items1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"items2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"items2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"count"},
					Source: vo.FieldSource{
						Val: 0,
					},
				},
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"count"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				assigner,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode": "loop_node_key",
				"assigner":  "loop_node_key",
			},
			Connections: []*compose2.Connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "assigner",
				},
				{
					FromNode: "assigner",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}
		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		ctxcache.Store(ctx, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		ctx, err := execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        ws.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		wfRepo := mockWorkflow.NewMockRepository(ctrl)
		wfRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().Unix(), nil).AnyTimes()
		defer mockey.Mock(workflow.GetRepository).Return(wfRepo).Build().UnPatch()

		ctx, err = execute.PrepareNodeExeCtx(ctx, "loop_node_key", "loop", entity.NodeTypeBatch, ptr.Of(vo.ReturnVariables))
		assert.NoError(t, err)
		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(ctx, map[string]any{
			"items1": []any{"a", "b"},
			"items2": []any{"a1", "b1", "c1"},
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": 6,
		}, out)
	})
}
