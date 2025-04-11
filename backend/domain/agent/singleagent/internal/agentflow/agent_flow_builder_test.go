package agentflow

import (
	"context"
	"testing"

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	modelMgrEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	agentMock "code.byted.org/flow/opencoze/backend/internal/mock/domain/agent/singleagent"
	chatModelMock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestBuildAgent(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	modelMgr := agentMock.NewMockModelMgr(ctrl)
	modelMgr.EXPECT().MGetModelByID(gomock.Any(), gomock.Any()).Return(
		[]*modelMgrEntity.Model{{
			ID: 888,
			Meta: modelMgrEntity.ModelMeta{
				Protocol: chatmodel.ProtocolArk,
			},
		}}, nil).AnyTimes()

	mc := &ark.ChatModelConfig{}

	arkModel, err := ark.NewChatModel(ctx, mc)
	assert.NoError(t, err)

	modelFactory := chatModelMock.NewMockFactory(ctrl)
	modelFactory.EXPECT().CreateChatModel(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(arkModel, nil).AnyTimes()

	toolSvr := agentMock.NewMockToolService(ctrl)

	// toolSvr.EXPECT().MGet(gomock.Any(), gomock.Any()).Return().AnyTimes()

	conf := &Config{
		Agent: &agentEntity.SingleAgent{
			ID:          666,
			AgentID:     666,
			DeveloperID: 666,
			SpaceID:     666,
			Name:        "Helpful Assistant",
			Desc:        "Analyze the needs of users in depth and provide targeted solutions.",
			IconURI:     "",
			State:       agentEntity.AgentStateOfDraft,
			ModelInfo: &agent_common.ModelInfo{
				ModelId: ptr.Of(int64(888)),
			},
			Prompt: &agent_common.PromptInfo{
				Prompt: `Analyze the needs of users in depth and provide targeted solutions.`,
			},
		},

		ModelMgrSvr:  modelMgr,
		ModelFactory: modelFactory,
		ToolSvr:      toolSvr,
		KnowledgeSvr: nil,
	}
	_ = conf
	// rn, err := BuildAgent(ctx, conf)
	// assert.NoError(t, err)
	//
	// req := &AgentRequest{
	// 	Input: schema.UserMessage("How should a person grow professionally?"),
	// 	History: []*schema.Message{
	// 		schema.UserMessage("my name is ZhangSan, 25 years old, the position is artificial intelligence application development"),
	// 	},
	// }
	// events, err := rn.StreamExecute(ctx, req)
	// assert.NoError(t, err)
	// _ = events
}
