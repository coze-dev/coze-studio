package workflow

import (
	"context"
	"os"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	schema2 "github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/canvas"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

func TestEntryExit(t *testing.T) {
	mockey.PatchConvey("test entry exit", t, func() {
		data, err := os.ReadFile("./canvas/examples/entry_exit.json")
		assert.NoError(t, err)

		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)

		ctx := context.Background()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any()).Return(1.0, nil).AnyTimes()

		mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
			AppVarStore: mockGlobalAppVarStore,
		}).Build()

		out, err := wf.runner.Stream(ctx, map[string]any{
			"arr": []any{"arr1", "arr2"},
			"obj": map[string]any{
				"field1": []any{"1234", "5678"},
			},
			"input": 3.5,
		})
		assert.NoError(t, err)
		out.Close()
	})
}

func TestLLMFromCanvas(t *testing.T) {
	mockey.PatchConvey("test llm from canvas", t, func() {
		data, err := os.ReadFile("./canvas/examples/llm.json")
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := context.Background()

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &utChatModel{
			streamResultProvider: func() (*schema2.StreamReader[*schema2.Message], error) {
				return schema2.StreamReaderFromArray([]*schema2.Message{
					{
						Role:    schema2.Assistant,
						Content: "I ",
					},
					{
						Role:    schema2.Assistant,
						Content: "don't know.",
					},
				}), nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		out, err := wf.runner.Stream(ctx, map[string]any{
			"input": "what's your name?",
		})
		assert.NoError(t, err)
		var fullOut string
		for {
			chunk, err := out.Recv()
			if err != nil {
				break
			}
			fullOut += chunk["output"].(string)
		}
		assert.Equal(t, "I don't know."+nodes.KeyIsFinished, fullOut)
		out.Close()
	})
}

func TestLoopSelectorFromCanvas(t *testing.T) {
	mockey.PatchConvey("test loop selector from canvas", t, func() {
		data, err := os.ReadFile("./canvas/examples/loop_selector_variable_assign_text_processor.json")
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := context.Background()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		out, err := wf.runner.Invoke(ctx, map[string]any{
			"query1": []any{"a", "bb", "ccc", "dddd"},
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"converted": []any{
				"new_a",
				"new_ccc",
			},
			"output": "dddd",
		}, out)
	})
}
