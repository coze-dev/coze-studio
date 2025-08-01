/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package agentflow

import (
	"fmt"
	"strings"
	"testing"

	"github.com/cloudwego/eino/schema"
)

func TestBuildAgent(t *testing.T) {
	// TODO: fix me later
	// 	ctx := context.Background()
	// 	ctrl := gomock.NewController(t)
	// 	modelMgr := agentMock.NewMockModelMgr(ctrl)
	// 	modelMgr.EXPECT().MGetModelByID(gomock.Any(), gomock.Any()).Return(
	// 		[]*modelMgrEntity.Model{{
	// 			ID: 888,
	// 			Meta: modelMgrEntity.ModelMeta{
	// 				Protocol: chatmodel.ProtocolArk,
	// 				ConnConfig: &chatmodel.Config{
	// 					Model:  "ep-20250116140937-fhwc2",
	// 					APIKey: "01945a34-8497-471d-821c-3695cbe2e4ba",
	// 				},
	// 			},
	// 		}}, nil).AnyTimes()

	// 	// mc := &ark.ChatModelConfig{
	// 	// 	Model:  "ep-20250116140937-fhwc2",
	// 	// 	APIKey: "01945a34-8497-471d-821c-3695cbe2e4ba",
	// 	// }
	// 	// arkModel, err := ark.NewChatModel(ctx, mc)
	// 	// assert.NoError(t, err)

	// 	sr, sw := schema.Pipe[*schema.Message](2)
	// 	sw.Send(schema.AssistantMessage("to be great", nil), nil)
	// 	sw.Close()
	// 	arkModel := mockChatModel.NewMockToolCallingChatModel(ctrl)
	// 	arkModel.EXPECT().Stream(gomock.Any(), gomock.Any(), gomock.Any()).Return(sr, nil).AnyTimes()
	// 	arkModel.EXPECT().WithTools(gomock.Any()).Return(arkModel, nil).Times(1)

	// 	modelFactory := mockChatModel.NewMockFactory(ctrl)
	// 	modelFactory.EXPECT().SupportProtocol(gomock.Any()).Return(true).AnyTimes()
	// 	modelFactory.EXPECT().CreateChatModel(gomock.Any(), gomock.Any(), gomock.Any()).
	// 		Return(arkModel, nil).AnyTimes()

	// 	pluginSvr := agentMock.NewMockPluginService(ctrl)

	// 	pluginSvr.EXPECT().MGetAgentTools(gomock.Any(), gomock.Any()).Return(
	// 		&service.MGetAgentToolsResponse{
	// 			Tools: []*pluginEntity.ToolInfo{
	// 				{
	// 					ID:       999,
	// 					PluginID: 999,
	// 					Operation: &pluginEntity.Openapi3Operation{
	// 						OperationID: "get_user_salary",
	// 						Summary: "Understand the monthly income of users",
	// 						Parameters: openapi3.Parameters{
	// 							{
	// 								Value: &openapi3.Parameter{
	// 									Name:        "email",
	// 									In:          "query",
	// 									Description: "user's identity",
	// 									Required:    true,
	// 									Schema: &openapi3.SchemaRef{
	// 										Value: &openapi3.Schema{
	// 											Type: openapi3.TypeString,
	// 										},
	// 									},
	// 								},
	// 							},
	// 						},
	// 						RequestBody: &openapi3.RequestBodyRef{
	// 							Value: &openapi3.RequestBody{
	// 								Description: "get user salary",
	// 								Content: openapi3.NewContentWithJSONSchema(&openapi3.Schema{
	// 									Type: openapi3.TypeObject,
	// 									Properties: openapi3.Schemas{
	// 										"scene": &openapi3.SchemaRef{
	// 											Value: &openapi3.Schema{
	// 												Type: openapi3.TypeString,
	// 											},
	// 										},
	// 									},
	// 								}),
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		}, nil).AnyTimes()

	// 	pluginSvr.EXPECT().ExecuteTool(gomock.Any(), gomock.Any(), gomock.Any()).
	// 		Return(&service.ExecuteToolResponse{
	// 			TrimmedResp: `{
	//   "salary": 9999,
	// }`,
	// 		}, nil).
	// 		AnyTimes()

	// 	klSvr := agentMock.NewMockKnowledge(ctrl)
	// 	klSvr.EXPECT().Retrieve(gomock.Any(), gomock.Any()).
	// 		Return(
	// 			&knowledge.RetrieveResponse{
	// 				RetrieveSlices: []*knowledge.RetrieveSlice{
	// 					{
	// 						Slice: &knowledgeEntity.Slice{
	// 							KnowledgeID: 777,
	// 							DocumentID:  1,
	// 							RawContent: []*knowledgeEntity.SliceContent{
	// 								{
	// 									Type: knowledgeEntity.SliceContentTypeText,
	// 									Text: ptr. Of ("learn computer science, become software developer, monthly salary is about 2W"),
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			}, nil).
	// 		AnyTimes()

	// 	wfSvr := agentMock.NewMockWorkflow(ctrl)
	// 	wfSvr.EXPECT().WorkflowAsModelTool(gomock.Any(), gomock.Any()).Return([]tool.BaseTool{}, nil).AnyTimes()

	// 	databaseSvr := agentMock.NewMockDatabase(ctrl)
	// 	databaseSvr.EXPECT().ExecuteSQL(gomock.Any(), gomock.Any()).Return(&dbService.ExecuteSQLResponse{
	// 		Records: []map[string]string{
	// 			{"name": "ZhangSan", "age": "25"},
	// 		},
	// 	}, nil).AnyTimes()

	// 	conf := &Config{
	// 		Agent: &agentEntity.SingleAgent{
	// 			AgentID:   666,
	// 			CreatorID: 666,
	// 			SpaceID:   666,
	// 			Name:      "Helpful Assistant",
	// 			Desc:      "Analyze the needs of users in depth and provide targeted solutions.",
	// 			IconURI:   "",
	// 			ModelInfo: &bot_common.ModelInfo{
	// 				ModelId: ptr.Of(int64(888)),
	// 			},
	// 			Prompt: &bot_common.PromptInfo{
	// 				Prompt: ptr.Of(`Analyze the needs of users in depth and provide targeted solutions.`),
	// 			},
	// 			Plugin: []*bot_common.PluginInfo{
	// 				{
	// 					ApiId: ptr.Of(int64(999)),
	// 				},
	// 			},
	// 			Knowledge: &bot_common.Knowledge{
	// 				KnowledgeInfo: []*bot_common.KnowledgeInfo{
	// 					{
	// 						Id:   ptr.Of("777"),
	// 						Name: ptr. Of ("Making Money Guide: Plan a career development path according to your personal interests and personal conditions to achieve the desired earning goals"),
	// 					},
	// 				},
	// 			},
	// 			Database: []*bot_common.Database{
	// 				{
	// 					TableId:   ptr.Of("1"),
	// 					TableName: ptr.Of("person age"),
	// 					TableDesc: ptr.Of("person age table"),
	// 					FieldList: []*bot_common.FieldItem{
	// 						{
	// 							Name:         ptr.Of("name"),
	// 							Desc:         ptr.Of("person name"),
	// 							Type:         ptr.Of(bot_common.FieldItemType_Text),
	// 							MustRequired: ptr.Of(true),
	// 							Id:           ptr.Of(int64(1)),
	// 							TypeStr:      ptr.Of("text"),
	// 							AlterId:      ptr.Of(int64(10001)),
	// 						},
	// 						{
	// 							Name:         ptr.Of("age"),
	// 							Desc:         ptr.Of("person age"),
	// 							Type:         ptr.Of(bot_common.FieldItemType_Number),
	// 							MustRequired: ptr.Of(false),
	// 							Id:           ptr.Of(int64(2)),
	// 							TypeStr:      ptr.Of("number"),
	// 							AlterId:      ptr.Of(int64(10002)),
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},

	// 		ModelFactory: modelFactory,
	// 	}
	// 	rn, err := BuildAgent(ctx, conf)
	// 	assert.NoError(t, err)

	// 	req := &AgentRequest{
	// 		Input: schema.UserMessage("How should a person grow professionally?"),
	// 		History: []*schema.Message{
	// 			schema.UserMessage("my name is ZhangSan, 25 years old, the position is artificial intelligence application development"),
	// 		},
	// 	}
	// 	events, err := rn.StreamExecute(ctx, req)
	// 	assert.NoError(t, err)
	// 	step := 0
	// 	for {
	// 		ev, err := events.Recv()
	// 		if errors.Is(err, io.EOF) {
	// 			break
	// 		}
	// 		assert.NoError(t, err)

	// 		switch ev.EventType {
	// 		case agentEntity.EventTypeOfKnowledge:
	// 			t.Logf("[step: %v] retrieve knowledge: %v", step, formatDocuments(ev.Knowledge))
	// 			continue
	// 		case agentEntity.EventTypeOfToolsMessage:
	// 			for idx, msg := range ev.ToolsMessage {
	// 				t.Logf("[step: %v] tool message %v: %v", step, idx, msg.String())
	// 			}
	// 			continue
	// 		case agentEntity.EventTypeOfFinalAnswer:
	// 			t.Logf("----- final message -----")
	// 			for {
	// 				msg, err := ev.FinalAnswer.Recv()
	// 				if errors.Is(err, io.EOF) {
	// 					break
	// 				}
	// 				assert.NoError(t, err)
	// 				if err != nil {
	// 					break
	// 				}

	//				fmt.Printf("%v", msg.Content)
	//			}
	//			fmt.Println()
	//			continue
	//		}
	//	}
}

func formatDocuments(docs []*schema.Document) string {
	var sb strings.Builder
	for i, doc := range docs {
		sb.WriteString(fmt.Sprintf("\n[seg: %v]: %v", i, doc.String()))
	}
	return sb.String()
}
