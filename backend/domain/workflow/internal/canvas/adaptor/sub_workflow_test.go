package adaptor

import (
	"context"
	"io"
	"os"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	mockWorkflowRepo "code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/mockrepo"
)

func TestSubWorkflowFromCanvas(t *testing.T) {
	mockey.PatchConvey("test sub workflow from canvas", t, func() {
		data, err := os.ReadFile("../examples/subworkflow/parent_workflow.json")
		assert.NoError(t, err)
		parentC := &canvas.Canvas{}
		err = sonic.Unmarshal(data, parentC)

		data, err = os.ReadFile("../examples/subworkflow/sub_workflow.json")
		assert.NoError(t, err)
		subC := &canvas.Canvas{}
		err = sonic.Unmarshal(data, subC)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()
		mockRepo := mockWorkflowRepo.NewMockRepository(ctrl)
		mockey.Mock(getRepo).Return(mockRepo).Build()

		ctx := context.Background()

		// 7496447646493212709
		mockRepo.EXPECT().GetSubWorkflowCanvas(ctx, gomock.Any()).Return(subC, nil).AnyTimes()

		chatModel := &utChatModel{
			streamResultProvider: func() (*schema.StreamReader[*schema.Message], error) {
				return schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     1,
								CompletionTokens: 2,
								TotalTokens:      3,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: "don't know.",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     1,
								CompletionTokens: 2,
								TotalTokens:      3,
							},
						},
					},
				}), nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		parentSC, err := CanvasToWorkflowSchema(ctx, parentC)
		assert.NoError(t, err)

		wf, err := compose.NewWorkflow(ctx, parentSC)
		assert.NoError(t, err)

		out, err := wf.Runner.Stream(ctx, map[string]any{"input": "what's your name?"})
		assert.NoError(t, err)

		var fullOutput string
		for {
			chunk, err := out.Recv()
			if err != nil {
				if err == io.EOF {
					break
				}
				assert.NoError(t, err)
				break
			}

			s := chunk["output"].(string)
			if s != nodes.KeyIsFinished {
				fullOutput += chunk["output"].(string)
			}
		}
		out.Close()
		assert.Equal(t, fullOutput, "I don't know.")
	})
}
