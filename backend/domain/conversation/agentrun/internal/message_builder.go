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
package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/cloudwego/eino/schema"

	messageModel "github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func buildSendMsg(_ context.Context, msg *msgEntity.Message, isFinish bool, rtDependence *AgentRuntime) *entity.ChunkMessageItem {

	copyMap := make(map[string]string)
	for k, v := range msg.Ext {
		copyMap[k] = v
	}

	return &entity.ChunkMessageItem{
		ID:               msg.ID,
		ConversationID:   msg.ConversationID,
		SectionID:        msg.SectionID,
		AgentID:          msg.AgentID,
		Content:          msg.Content,
		Role:             entity.RoleTypeAssistant,
		ContentType:      msg.ContentType,
		MessageType:      msg.MessageType,
		ReplyID:          rtDependence.GetQuestionMsgID(),
		Type:             msg.MessageType,
		CreatedAt:        msg.CreatedAt,
		UpdatedAt:        msg.UpdatedAt,
		RunID:            rtDependence.GetRunRecord().ID,
		Ext:              copyMap,
		IsFinish:         isFinish,
		ReasoningContent: ptr.Of(msg.ReasoningContent),
	}
}

func buildKnowledge(_ context.Context, chunk *entity.AgentRespEvent) *msgEntity.VerboseInfo {
	var recallDatas []msgEntity.RecallDataInfo
	for _, kOne := range chunk.Knowledge {
		recallDatas = append(recallDatas, msgEntity.RecallDataInfo{
			Slice: kOne.Content,
			Meta: msgEntity.MetaInfo{
				Dataset: msgEntity.DatasetInfo{
					ID:   kOne.MetaData["dataset_id"].(string),
					Name: kOne.MetaData["dataset_name"].(string),
				},
				Document: msgEntity.DocumentInfo{
					ID:   kOne.MetaData["document_id"].(string),
					Name: kOne.MetaData["document_name"].(string),
				},
			},
			Score: kOne.Score(),
		})
	}

	verboseData := &msgEntity.VerboseData{
		Chunks:     recallDatas,
		OriReq:     "",
		StatusCode: 0,
	}
	data, err := json.Marshal(verboseData)
	if err != nil {
		return nil
	}
	knowledgeInfo := &msgEntity.VerboseInfo{
		MessageType: string(entity.MessageSubTypeKnowledgeCall),
		Data:        string(data),
	}
	return knowledgeInfo
}

func buildBotStateExt(arm *entity.AgentRunMeta) *msgEntity.BotStateExt {
	agentID := strconv.FormatInt(arm.AgentID, 10)
	botStateExt := &msgEntity.BotStateExt{
		AgentID:   agentID,
		AgentName: arm.Name,
		Awaiting:  agentID,
		BotID:     agentID,
	}

	return botStateExt
}

type irMsg struct {
	Type        string `json:"type,omitempty"`
	ContentType string `json:"content_type"`
	Content     any    `json:"content"` // either optionContent or string
	ID          string `json:"id,omitempty"`
}

func parseInterruptData(_ context.Context, interruptData *singleagent.InterruptInfo) (string, message.ContentType, error) {

	defaultContentType := message.ContentTypeText
	switch interruptData.InterruptType {
	case singleagent.InterruptEventType_OauthPlugin:
		data := interruptData.AllToolInterruptData[interruptData.ToolCallID].ToolNeedOAuth.Message
		return data, defaultContentType, nil
	case singleagent.InterruptEventType_Question:
		data := interruptData.AllWfInterruptData[interruptData.ToolCallID].InterruptData
		return processQuestionInterruptData(data)
	case singleagent.InterruptEventType_InputNode:
		data := interruptData.AllWfInterruptData[interruptData.ToolCallID].InterruptData
		return processInputNodeInterruptData(data)
	case singleagent.InterruptEventType_WorkflowLLM:
		toolInterruptEvent := interruptData.AllWfInterruptData[interruptData.ToolCallID].ToolInterruptEvent
		data := toolInterruptEvent.InterruptData
		if singleagent.InterruptEventType(toolInterruptEvent.EventType) == singleagent.InterruptEventType_InputNode {
			return processInputNodeInterruptData(data)
		}
		if singleagent.InterruptEventType(toolInterruptEvent.EventType) == singleagent.InterruptEventType_Question {
			return processQuestionInterruptData(data)
		}
		return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)

	}
	return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)
}

func processQuestionInterruptData(data string) (string, message.ContentType, error) {
	defaultContentType := message.ContentTypeText
	var iData map[string][]*irMsg
	err := json.Unmarshal([]byte(data), &iData)
	if err != nil {
		return "", defaultContentType, err
	}
	if len(iData["messages"]) == 0 {
		return "", defaultContentType, errorx.New(errno.ErrInterruptDataEmpty)
	}
	interruptMsg := iData["messages"][0]

	if interruptMsg.ContentType == "text" {
		return interruptMsg.Content.(string), defaultContentType, nil
	} else if interruptMsg.ContentType == "option" || interruptMsg.ContentType == "form_schema" {
		iMarshalData, err := json.Marshal(interruptMsg)
		if err != nil {
			return "", defaultContentType, err
		}
		return string(iMarshalData), message.ContentTypeCard, nil
	}
	return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)
}

func processInputNodeInterruptData(data string) (string, message.ContentType, error) {
	return data, message.ContentTypeCard, nil
}

func handlerUsage(meta *schema.ResponseMeta) *msgEntity.UsageExt {
	if meta == nil || meta.Usage == nil {
		return nil
	}

	return &msgEntity.UsageExt{
		TotalCount:   int64(meta.Usage.TotalTokens),
		InputTokens:  int64(meta.Usage.PromptTokens),
		OutputTokens: int64(meta.Usage.CompletionTokens),
	}
}

func preCreateAnswer(ctx context.Context, rtDependence *AgentRuntime) (*msgEntity.Message, error) {
	arm := rtDependence.RunMeta
	msgMeta := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          rtDependence.RunRecord.ID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		Role:           schema.Assistant,
		MessageType:    message.MessageTypeAnswer,
		ContentType:    message.ContentTypeText,
		Ext:            arm.Ext,
	}

	if arm.Ext == nil {
		msgMeta.Ext = map[string]string{}
	}

	botStateExt := buildBotStateExt(arm)
	bseString, err := json.Marshal(botStateExt)
	if err != nil {
		return nil, err
	}

	if _, ok := msgMeta.Ext[string(msgEntity.MessageExtKeyBotState)]; !ok {
		msgMeta.Ext[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
	}

	msgMeta.Ext = arm.Ext
	return crossmessage.DefaultSVC().PreCreate(ctx, msgMeta)
}

func buildAdditionalMessage2Create(ctx context.Context, runRecord *entity.RunRecordMeta, additionalMessage *entity.AdditionalMessage, userID string) *message.Message {

	msg := &msgEntity.Message{
		ConversationID: runRecord.ConversationID,
		RunID:          runRecord.ID,
		AgentID:        runRecord.AgentID,
		SectionID:      runRecord.SectionID,
		UserID:         userID,
		MessageType:    additionalMessage.Type,
	}

	switch additionalMessage.Type {
	case message.MessageTypeQuestion:
		msg.Role = schema.User
		msg.ContentType = additionalMessage.ContentType
		for _, content := range additionalMessage.Content {
			if content.Type == message.InputTypeText {
				msg.Content = content.Text
				break
			}
		}
		msg.MultiContent = additionalMessage.Content

	case message.MessageTypeAnswer:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText
		for _, content := range additionalMessage.Content {
			if content.Type == message.InputTypeText {
				msg.Content = content.Text
				break
			}
		}
		modelContent := &schema.Message{
			Role:    schema.Assistant,
			Content: msg.Content,
		}

		jsonContent, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = string(jsonContent)
		}
	}
	return msg
}

func buildAgentMessage2Create(ctx context.Context, chunk *entity.AgentRespEvent, messageType message.MessageType, rtDependence *AgentRuntime) *message.Message {
	arm := rtDependence.GetRunMeta()
	msg := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          rtDependence.RunRecord.ID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		MessageType:    messageType,
	}
	buildExt := map[string]string{}

	timeCost := fmt.Sprintf("%.1f", float64(time.Since(rtDependence.GetStartTime()).Milliseconds())/1000.00)

	switch messageType {
	case message.MessageTypeQuestion:
		msg.Role = schema.User
		msg.ContentType = arm.ContentType
		for _, content := range arm.Content {
			if content.Type == message.InputTypeText {
				msg.Content = content.Text
				break
			}
		}
		msg.MultiContent = arm.Content
		buildExt = arm.Ext

		msg.DisplayContent = arm.DisplayContent
	case message.MessageTypeAnswer, message.MessageTypeToolAsAnswer:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText

	case message.MessageTypeToolResponse:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText
		msg.Content = chunk.ToolsMessage[0].Content

		buildExt[string(msgEntity.MessageExtKeyTimeCost)] = timeCost
		modelContent := chunk.ToolsMessage[0]
		mc, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = string(mc)
		}

	case message.MessageTypeKnowledge:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText

		knowledgeContent := buildKnowledge(ctx, chunk)
		if knowledgeContent != nil {
			knInfo, err := json.Marshal(knowledgeContent)
			if err == nil {
				msg.Content = string(knInfo)
			}
		}

		buildExt[string(msgEntity.MessageExtKeyTimeCost)] = timeCost

		modelContent := chunk.Knowledge
		mc, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = string(mc)
		}

	case message.MessageTypeFunctionCall:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText

		if len(chunk.FuncCall.ToolCalls) > 0 {
			toolCall := chunk.FuncCall.ToolCalls[0]
			toolCalling, err := json.Marshal(toolCall)
			if err == nil {
				msg.Content = string(toolCalling)
			}
			buildExt[string(msgEntity.MessageExtKeyPlugin)] = toolCall.Function.Name
			buildExt[string(msgEntity.MessageExtKeyToolName)] = toolCall.Function.Name
			buildExt[string(msgEntity.MessageExtKeyTimeCost)] = timeCost

			modelContent := chunk.FuncCall
			mc, err := json.Marshal(modelContent)
			if err == nil {
				msg.ModelContent = string(mc)
			}
		}
	case message.MessageTypeFlowUp:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText
		msg.Content = chunk.Suggest.Content

	case message.MessageTypeVerbose:
		msg.Role = schema.Assistant
		msg.ContentType = message.ContentTypeText

		d := &entity.Data{
			FinishReason: 0,
			FinData:      "",
		}
		dByte, _ := json.Marshal(d)
		afc := &entity.AnswerFinshContent{
			MsgType: entity.MessageSubTypeGenerateFinish,
			Data:    string(dByte),
		}
		afcMarshal, _ := json.Marshal(afc)
		msg.Content = string(afcMarshal)
	case message.MessageTypeInterrupt:
		msg.Role = schema.Assistant
		msg.MessageType = message.MessageTypeVerbose
		msg.ContentType = message.ContentTypeText

		afc := &entity.AnswerFinshContent{
			MsgType: entity.MessageSubTypeInterrupt,
			Data:    "",
		}
		afcMarshal, _ := json.Marshal(afc)
		msg.Content = string(afcMarshal)

		// Add ext to save to context_message
		interruptByte, err := json.Marshal(chunk.Interrupt)
		if err == nil {
			buildExt[string(msgEntity.ExtKeyResumeInfo)] = string(interruptByte)
		}
		buildExt[string(msgEntity.ExtKeyToolCallsIDs)] = chunk.Interrupt.ToolCallID
		rc := &messageModel.RequiredAction{
			Type:              "submit_tool_outputs",
			SubmitToolOutputs: &messageModel.SubmitToolOutputs{},
		}
		msg.RequiredAction = rc
		rcExtByte, err := json.Marshal(rc)
		if err == nil {
			buildExt[string(msgEntity.ExtKeyRequiresAction)] = string(rcExtByte)
		}
	}

	if messageType != message.MessageTypeQuestion {
		botStateExt := buildBotStateExt(arm)
		bseString, err := json.Marshal(botStateExt)
		if err == nil {
			buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
		}
	}
	msg.Ext = buildExt
	return msg
}

func handlerWfInterruptEvent(_ context.Context, interruptEventData *crossworkflow.InterruptEvent) (string, message.ContentType, error) {
	defaultContentType := message.ContentTypeText
	switch singleagent.InterruptEventType(interruptEventData.EventType) {
	case singleagent.InterruptEventType_OauthPlugin:

	case singleagent.InterruptEventType_Question:
		data := interruptEventData.InterruptData
		return processQuestionInterruptData(data)
	case singleagent.InterruptEventType_InputNode:
		data := interruptEventData.InterruptData
		return processInputNodeInterruptData(data)
	case singleagent.InterruptEventType_WorkflowLLM:
		data := interruptEventData.ToolInterruptEvent.InterruptData
		if singleagent.InterruptEventType(interruptEventData.EventType) == singleagent.InterruptEventType_InputNode {
			return processInputNodeInterruptData(data)
		}
		if singleagent.InterruptEventType(interruptEventData.EventType) == singleagent.InterruptEventType_Question {
			return processQuestionInterruptData(data)
		}
		return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)
	}
	return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)
}

func historyPairs(historyMsg []*message.Message) []*message.Message {

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

func transMessageToSchemaMessage(ctx context.Context, msgs []*message.Message, imagexClient imagex.ImageX) []*schema.Message {
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
		schemaMessage = append(schemaMessage, parseMessageURI(ctx, sm, imagexClient))
	}

	return schemaMessage
}

func parseMessageURI(ctx context.Context, mcMsg *schema.Message, imagexClient imagex.ImageX) *schema.Message {
	if mcMsg.MultiContent == nil {
		return mcMsg
	}
	for k, one := range mcMsg.MultiContent {
		switch one.Type {
		case schema.ChatMessagePartTypeImageURL:

			if one.ImageURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.ImageURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].ImageURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeFileURL:
			if one.FileURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.FileURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].FileURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeAudioURL:
			if one.AudioURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.AudioURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].AudioURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeVideoURL:
			if one.VideoURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.VideoURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].VideoURL.URL = url.URL
				}
			}
		}
	}
	return mcMsg
}

func parseResumeInfo(_ context.Context, historyMsg []*message.Message) *crossagent.ResumeInfo {

	var resumeInfo *crossagent.ResumeInfo
	for i := len(historyMsg) - 1; i >= 0; i-- {
		if historyMsg[i].MessageType == message.MessageTypeQuestion {
			break
		}
		if historyMsg[i].MessageType == message.MessageTypeVerbose {
			if historyMsg[i].Ext[string(msgEntity.ExtKeyResumeInfo)] != "" {
				err := json.Unmarshal([]byte(historyMsg[i].Ext[string(msgEntity.ExtKeyResumeInfo)]), &resumeInfo)
				if err != nil {
					return nil
				}
			}
		}
	}
	return resumeInfo
}

func buildSendRunRecord(_ context.Context, runRecord *entity.RunRecordMeta, runStatus entity.RunStatus) *entity.ChunkRunItem {
	return &entity.ChunkRunItem{
		ID:             runRecord.ID,
		ConversationID: runRecord.ConversationID,
		AgentID:        runRecord.AgentID,
		SectionID:      runRecord.SectionID,
		Status:         runStatus,
		CreatedAt:      runRecord.CreatedAt,
	}
}
