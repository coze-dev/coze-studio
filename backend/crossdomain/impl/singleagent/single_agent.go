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

package agent

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agent"
	singleagent "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/service"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

var defaultSVC crossagent.SingleAgent

type impl struct {
	DomainSVC singleagent.SingleAgent
	ImagexSVC imagex.ImageX
}

func InitDomainService(c singleagent.SingleAgent, imagexClient imagex.ImageX) crossagent.SingleAgent {
	defaultSVC = &impl{
		DomainSVC: c,
		ImagexSVC: imagexClient,
	}

	return defaultSVC
}

func (c *impl) StreamExecute(ctx context.Context, historyMsg []*message.Message,
	query *message.Message, agentRuntime *model.AgentRuntime,
) (*schema.StreamReader[*model.AgentEvent], error) {

	historyMsg = c.historyPairs(historyMsg)

	singleAgentStreamExecReq := c.buildSingleAgentStreamExecuteReq(ctx, historyMsg, query, agentRuntime)

	streamEvent, err := c.DomainSVC.StreamExecute(ctx, singleAgentStreamExecReq)
	logs.CtxInfof(ctx, "agent StreamExecute req:%v, streamEvent:%v, err:%v", conv.DebugJsonToStr(singleAgentStreamExecReq), streamEvent, err)
	return streamEvent, err
}

func (c *impl) buildSingleAgentStreamExecuteReq(ctx context.Context, historyMsg []*message.Message,
	input *message.Message, agentRuntime *model.AgentRuntime,
) *model.ExecuteRequest {
	identity := c.buildIdentity(input, agentRuntime)
	inputBuild := c.buildSchemaMessage(ctx, []*message.Message{input})
	var inputSM *schema.Message
	if len(inputBuild) > 0 {
		inputSM = inputBuild[0]
	}
	history := c.buildSchemaMessage(ctx, historyMsg)

	resumeInfo := c.checkResumeInfo(ctx, historyMsg)

	return &model.ExecuteRequest{
		Identity: identity,
		Input:    inputSM,
		History:  history,
		UserID:   input.UserID,
		PreCallTools: slices.Transform(agentRuntime.PreRetrieveTools, func(tool *agentrun.Tool) *agentrun.ToolsRetriever {
			return &agentrun.ToolsRetriever{
				PluginID:  tool.PluginID,
				ToolName:  tool.ToolName,
				ToolID:    tool.ToolID,
				Arguments: tool.Arguments,
				Type: func(toolType agentrun.ToolType) agentrun.ToolType {
					switch toolType {
					case agentrun.ToolTypeWorkflow:
						return agentrun.ToolTypeWorkflow
					case agentrun.ToolTypePlugin:
						return agentrun.ToolTypePlugin
					}
					return agentrun.ToolTypePlugin
				}(tool.Type),
			}
		}),

		ResumeInfo: resumeInfo,
	}
}

func (c *impl) historyPairs(historyMsg []*message.Message) []*message.Message {

	fcMsgPairs := make(map[int64][]*message.Message)
	for _, one := range historyMsg {
		if one.MessageType != message.MessageTypeFunctionCall && one.MessageType != message.MessageTypeToolResponse {
			continue
		}
		if _, ok := fcMsgPairs[one.RunID]; !ok {
			fcMsgPairs[one.RunID] = []*message.Message{one}
		} else {
			fcMsgPairs[one.RunID] = append(fcMsgPairs[one.RunID], one)
		}
	}

	var historyAfterPairs []*message.Message
	for _, value := range historyMsg {
		if value.MessageType == message.MessageTypeFunctionCall {
			if len(fcMsgPairs[value.RunID])%2 == 0 {
				historyAfterPairs = append(historyAfterPairs, value)
			}
		} else {
			historyAfterPairs = append(historyAfterPairs, value)
		}
	}
	return historyAfterPairs

}
func (c *impl) checkResumeInfo(_ context.Context, historyMsg []*message.Message) *crossagent.ResumeInfo {

	var resumeInfo *crossagent.ResumeInfo
	for i := len(historyMsg) - 1; i >= 0; i-- {
		if historyMsg[i].MessageType == message.MessageTypeQuestion {
			break
		}
		if historyMsg[i].MessageType == message.MessageTypeVerbose {
			if historyMsg[i].Ext[string(entity.ExtKeyResumeInfo)] != "" {
				err := json.Unmarshal([]byte(historyMsg[i].Ext[string(entity.ExtKeyResumeInfo)]), &resumeInfo)
				if err != nil {
					return nil
				}
			}
		}
	}

	return resumeInfo
}

func (c *impl) buildSchemaMessage(ctx context.Context, msgs []*message.Message) []*schema.Message {
	schemaMessage := make([]*schema.Message, 0, len(msgs))

	for _, msgOne := range msgs {
		if msgOne.ModelContent == "" {
			continue
		}
		if msgOne.MessageType == message.MessageTypeVerbose || msgOne.MessageType == message.MessageTypeFlowUp {
			continue
		}
		var sm *schema.Message
		err := json.Unmarshal([]byte(msgOne.ModelContent), &sm)
		if err != nil {
			continue
		}
		if len(sm.ReasoningContent) > 0 {
			sm.ReasoningContent = ""
		}

		schemaMessage = append(schemaMessage, c.parseMessageURI(ctx, sm))
	}

	return schemaMessage
}

func (c *impl) parseMessageURI(ctx context.Context, mcMsg *schema.Message) *schema.Message {
	if mcMsg.MultiContent == nil {
		return mcMsg
	}
	for k, one := range mcMsg.MultiContent {
		switch one.Type {
		case schema.ChatMessagePartTypeImageURL:

			if one.ImageURL.URI != "" {
				url, err := c.ImagexSVC.GetResourceURL(ctx, one.ImageURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].ImageURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeFileURL:
			if one.FileURL.URI != "" {
				url, err := c.ImagexSVC.GetResourceURL(ctx, one.FileURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].FileURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeAudioURL:
			if one.AudioURL.URI != "" {
				url, err := c.ImagexSVC.GetResourceURL(ctx, one.AudioURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].AudioURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeVideoURL:
			if one.VideoURL.URI != "" {
				url, err := c.ImagexSVC.GetResourceURL(ctx, one.VideoURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].VideoURL.URL = url.URL
				}
			}
		}
	}
	return mcMsg
}

func (c *impl) buildIdentity(input *message.Message, agentRuntime *model.AgentRuntime) *model.AgentIdentity {
	return &model.AgentIdentity{
		AgentID:     input.AgentID,
		Version:     agentRuntime.AgentVersion,
		IsDraft:     agentRuntime.IsDraft,
		ConnectorID: agentRuntime.ConnectorID,
	}
}

func (c *impl) GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *model.SingleAgent, err error) {
	agentInfo, err := c.DomainSVC.GetSingleAgent(ctx, agentID, version)
	if err != nil {
		return nil, err
	}

	return agentInfo.SingleAgent, nil
}

func (c *impl) ObtainAgentByIdentity(ctx context.Context, identity *model.AgentIdentity) (*model.SingleAgent, error) {
	agentInfo, err := c.DomainSVC.ObtainAgentByIdentity(ctx, identity)
	if err != nil {
		return nil, err
	}
	return agentInfo.SingleAgent, nil
}
