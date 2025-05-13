package agentflow

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/plugin/service"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	modelMgrEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	agentMock "code.byted.org/flow/opencoze/backend/internal/mock/domain/agent/singleagent"
	mockChatModel "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/chatmodel"
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

	// mc := &ark.ChatModelConfig{
	// 	Model:  "ep-20250116140937-fhwc2",
	// 	APIKey: "01945a34-8497-471d-821c-3695cbe2e4ba",
	// }
	// arkModel, err := ark.NewChatModel(ctx, mc)
	// assert.NoError(t, err)

	sr, sw := schema.Pipe[*schema.Message](2)
	sw.Send(schema.AssistantMessage("to be great", nil), nil)
	sw.Close()
	arkModel := mockChatModel.NewMockChatModel(ctrl)
	arkModel.EXPECT().Stream(gomock.Any(), gomock.Any(), gomock.Any()).Return(sr, nil).AnyTimes()
	arkModel.EXPECT().BindTools(gomock.Any()).Return(nil).Times(1)

	modelFactory := mockChatModel.NewMockFactory(ctrl)
	modelFactory.EXPECT().SupportProtocol(gomock.Any()).Return(true).AnyTimes()
	modelFactory.EXPECT().CreateChatModel(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(arkModel, nil).AnyTimes()

	pluginSvr := agentMock.NewMockPluginService(ctrl)

	pluginSvr.EXPECT().MGetAgentTools(gomock.Any(), gomock.Any()).Return(
		&service.MGetAgentToolsResponse{
			Tools: []*pluginEntity.ToolInfo{
				{
					ID:       999,
					PluginID: 999,
					Operation: &openapi3.Operation{
						OperationID: "get_user_salary",
						Description: "了解用户的月收入情况",
						Parameters: openapi3.Parameters{
							{
								Value: &openapi3.Parameter{
									Name:        "email",
									In:          "query",
									Description: "user's identity",
									Required:    true,
									Schema: &openapi3.SchemaRef{
										Value: &openapi3.Schema{
											Type: openapi3.TypeString,
										},
									},
								},
							},
						},
						RequestBody: &openapi3.RequestBodyRef{
							Value: &openapi3.RequestBody{
								Description: "get user salary",
								Content: openapi3.NewContentWithJSONSchema(&openapi3.Schema{
									Type: openapi3.TypeObject,
									Properties: openapi3.Schemas{
										"scene": &openapi3.SchemaRef{
											Value: &openapi3.Schema{
												Type: openapi3.TypeString,
											},
										},
									},
								}),
							},
						},
					},
				},
			},
		}, nil).AnyTimes()

	pluginSvr.EXPECT().ExecuteTool(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(&service.ExecuteToolResponse{
			TrimmedResp: `{
  "salary": 9999,
}`,
		}, nil).
		AnyTimes()

	klSvr := agentMock.NewMockKnowledge(ctrl)
	klSvr.EXPECT().Retrieve(gomock.Any(), gomock.Any()).
		Return(
			[]*knowledge.RetrieveSlice{
				{
					Slice: &knowledgeEntity.Slice{
						KnowledgeID: 777,
						DocumentID:  1,
						PlainText:   "learn computer science, become software developer, 月薪 2W 左右",
					},
				},
			}, nil).
		AnyTimes()

	wfSvr := agentMock.NewMockWorkflow(ctrl)
	wfSvr.EXPECT().WorkflowAsModelTool(gomock.Any(), gomock.Any()).Return([]tool.BaseTool{}, nil).AnyTimes()

	conf := &Config{
		Agent: &agentEntity.SingleAgent{
			AgentID:   666,
			CreatorID: 666,
			SpaceID:   666,
			Name:      "Helpful Assistant",
			Desc:      "Analyze the needs of users in depth and provide targeted solutions.",
			IconURI:   "",
			State:     agentEntity.AgentStateOfDraft,
			ModelInfo: &bot_common.ModelInfo{
				ModelId: ptr.Of(int64(888)),
			},
			Prompt: &bot_common.PromptInfo{
				Prompt: ptr.Of(`Analyze the needs of users in depth and provide targeted solutions.`),
			},
			Plugin: []*bot_common.PluginInfo{
				{
					ApiId: ptr.Of(int64(999)),
				},
			},
			Knowledge: &bot_common.Knowledge{
				KnowledgeInfo: []*bot_common.KnowledgeInfo{
					{
						Id:   ptr.Of("777"),
						Name: ptr.Of("赚钱指南：根据你的个人兴趣、个人条件规划职业发展路径，达成所需的赚钱目标"),
					},
				},
			},
		},

		ModelMgrSvr:  modelMgr,
		ModelFactory: modelFactory,
		PluginSvr:    pluginSvr,
		KnowledgeSvr: klSvr,
		WorkflowSvr:  wfSvr,
	}
	rn, err := BuildAgent(ctx, conf)
	assert.NoError(t, err)

	req := &AgentRequest{
		Input: schema.UserMessage("How should a person grow professionally?"),
		History: []*schema.Message{
			schema.UserMessage("my name is ZhangSan, 25 years old, the position is artificial intelligence application development"),
		},
	}
	events, err := rn.StreamExecute(ctx, req)
	assert.NoError(t, err)
	step := 0
	for {
		ev, err := events.Recv()
		if errors.Is(err, io.EOF) {
			break
		}
		assert.NoError(t, err)

		switch ev.EventType {
		case agentEntity.EventTypeOfKnowledge:
			t.Logf("[step: %v] retrieve knowledge: %v", step, formatDocuments(ev.Knowledge))
			continue
		case agentEntity.EventTypeOfToolsMessage:
			for idx, msg := range ev.ToolsMessage {
				t.Logf("[step: %v] tool message %v: %v", step, idx, msg.String())
			}
			continue
		case agentEntity.EventTypeOfFinalAnswer:
			t.Logf("----- final message -----")
			for {
				msg, err := ev.FinalAnswer.Recv()
				if errors.Is(err, io.EOF) {
					break
				}
				assert.NoError(t, err)
				if err != nil {
					break
				}

				fmt.Printf("%v", msg.Content)
			}
			fmt.Println()
			continue
		}
	}
}

func formatDocuments(docs []*schema.Document) string {
	var sb strings.Builder
	for i, doc := range docs {
		sb.WriteString(fmt.Sprintf("\n[seg: %v]: %v", i, doc.String()))
	}
	return sb.String()
}
