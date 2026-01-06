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
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/mohae/deepcopy"

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"

	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Event struct {
}

func NewMessageEvent() *Event {
	return &Event{}
}

func (e *Event) buildMessageEvent(runEvent entity.RunEvent, chunkMsgItem *entity.ChunkMessageItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:            runEvent,
		ChunkMessageItem: chunkMsgItem,
	}
}

func (e *Event) buildRunEvent(runEvent entity.RunEvent, chunkRunItem *entity.ChunkRunItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:        runEvent,
		ChunkRunItem: chunkRunItem,
	}
}

func (e *Event) buildErrEvent(runEvent entity.RunEvent, err *entity.RunError) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event: runEvent,
		Error: err,
	}
}

func (e *Event) buildStreamDoneEvent() *entity.AgentRunResponse {

	return &entity.AgentRunResponse{
		Event: entity.RunEventStreamDone,
	}
}

func (e *Event) SendRunEvent(runEvent entity.RunEvent, runItem *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildRunEvent(runEvent, runItem)
	sw.Send(resp, nil)
}

func (e *Event) SendMsgEvent(runEvent entity.RunEvent, messageItem *entity.ChunkMessageItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildMessageEvent(runEvent, messageItem)
	sw.Send(resp, nil)
}

func (e *Event) SendErrEvent(runEvent entity.RunEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], err *entity.RunError) {
	resp := e.buildErrEvent(runEvent, err)
	sw.Send(resp, nil)
}

func (e *Event) SendStreamDoneEvent(sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildStreamDoneEvent()
	sw.Send(resp, nil)
}

type MessageEventHandler struct {
	messageEvent *Event
	sw           *schema.StreamWriter[*entity.AgentRunResponse]
}

func (mh *MessageEventHandler) handlerErr(_ context.Context, err error) {

	var errMsg string
	var statusErr errorx.StatusError
	if errors.As(err, &statusErr) {
		errMsg = statusErr.Msg()
	} else {
		if strings.ToLower(os.Getenv(consts.RunMode)) != "debug" {
			errMsg = "Internal Server Error"
		} else {
			errMsg = errorx.ErrorWithoutStack(err)
		}
	}

	mh.messageEvent.SendErrEvent(entity.RunEventError, mh.sw, &entity.RunError{
		Code: errno.ErrAgentRun,
		Msg:  errMsg,
	})
}

func (mh *MessageEventHandler) handlerAckMessage(_ context.Context, input *msgEntity.Message) error {
	sendMsg := &entity.ChunkMessageItem{
		ID:             input.ID,
		ConversationID: input.ConversationID,
		SectionID:      input.SectionID,
		AgentID:        input.AgentID,
		Role:           entity.RoleType(input.Role),
		MessageType:    message.MessageTypeAck,
		ReplyID:        input.ID,
		Content:        input.Content,
		ContentType:    message.ContentTypeText,
		IsFinish:       true,
	}

	mh.messageEvent.SendMsgEvent(entity.RunEventAck, sendMsg, mh.sw)

	return nil
}

func (mh *MessageEventHandler) handlerFunctionCall(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime) error {
	cm := buildAgentMessage2Create(ctx, chunk, message.MessageTypeFunctionCall, rtDependence)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)
	return nil
}

func (mh *MessageEventHandler) handlerTooResponse(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime, preToolResponseMsg *msgEntity.Message, toolResponseMsgContent string) error {

	cm := buildAgentMessage2Create(ctx, chunk, message.MessageTypeToolResponse, rtDependence)

	var cmData *message.Message
	var err error

	if preToolResponseMsg != nil {
		cm.ID = preToolResponseMsg.ID
		cm.CreatedAt = preToolResponseMsg.CreatedAt
		cm.UpdatedAt = preToolResponseMsg.UpdatedAt
		if len(toolResponseMsgContent) > 0 {
			cm.Content = toolResponseMsgContent + "\n" + cm.Content
		}
	}

	cmData, err = crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)

	return nil
}

func (mh *MessageEventHandler) handlerSuggest(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime) error {
	cm := buildAgentMessage2Create(ctx, chunk, message.MessageTypeFlowUp, rtDependence)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)

	return nil
}

func (mh *MessageEventHandler) handlerKnowledge(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime) error {
	cm := buildAgentMessage2Create(ctx, chunk, message.MessageTypeKnowledge, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)
	return nil
}

func (mh *MessageEventHandler) handlerAnswer(ctx context.Context, msg *entity.ChunkMessageItem, usage *msgEntity.UsageExt, rtDependence *AgentRuntime, preAnswerMsg *msgEntity.Message) error {

	if len(msg.Content) == 0 && len(ptr.From(msg.ReasoningContent)) == 0 {
		return nil
	}

	msg.IsFinish = true

	if msg.Ext == nil {
		msg.Ext = map[string]string{}
	}
	if usage != nil {
		msg.Ext[string(msgEntity.MessageExtKeyToken)] = strconv.FormatInt(usage.TotalCount, 10)
		msg.Ext[string(msgEntity.MessageExtKeyInputTokens)] = strconv.FormatInt(usage.InputTokens, 10)
		msg.Ext[string(msgEntity.MessageExtKeyOutputTokens)] = strconv.FormatInt(usage.OutputTokens, 10)

		rtDependence.Usage = &agentrun.Usage{
			LlmPromptTokens:     usage.InputTokens,
			LlmCompletionTokens: usage.OutputTokens,
			LlmTotalTokens:      usage.TotalCount,
		}
	}

	if _, ok := msg.Ext[string(msgEntity.MessageExtKeyTimeCost)]; !ok {
		msg.Ext[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(rtDependence.GetStartTime()).Milliseconds())/1000.00)
	}

	buildModelContent := &schema.Message{
		Role:    schema.Assistant,
		Content: msg.Content,
	}

	mc, err := json.Marshal(buildModelContent)
	if err != nil {
		return err
	}
	preAnswerMsg.Content = msg.Content
	preAnswerMsg.ReasoningContent = ptr.From(msg.ReasoningContent)
	preAnswerMsg.Ext = msg.Ext
	preAnswerMsg.ContentType = msg.ContentType
	preAnswerMsg.ModelContent = string(mc)
	preAnswerMsg.CreatedAt = 0
	preAnswerMsg.UpdatedAt = 0

	_, err = crossmessage.DefaultSVC().Create(ctx, preAnswerMsg)
	if err != nil {
		return err
	}
	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, msg, mh.sw)

	return nil
}

func (mh *MessageEventHandler) handlerFinalAnswerFinish(ctx context.Context, rtDependence *AgentRuntime) error {
	cm := buildAgentMessage2Create(ctx, nil, message.MessageTypeVerbose, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)
	return nil
}

func (mh *MessageEventHandler) handlerInterruptVerbose(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime) error {
	cm := buildAgentMessage2Create(ctx, chunk, message.MessageTypeInterrupt, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := buildSendMsg(ctx, cmData, true, rtDependence)

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, mh.sw)
	return nil
}

func (mh *MessageEventHandler) handlerWfUsage(ctx context.Context, msg *entity.ChunkMessageItem, usage *msgEntity.UsageExt) error {

	if msg.Ext == nil {
		msg.Ext = map[string]string{}
	}
	if usage != nil {
		msg.Ext[string(msgEntity.MessageExtKeyToken)] = strconv.FormatInt(usage.TotalCount, 10)
		msg.Ext[string(msgEntity.MessageExtKeyInputTokens)] = strconv.FormatInt(usage.InputTokens, 10)
		msg.Ext[string(msgEntity.MessageExtKeyOutputTokens)] = strconv.FormatInt(usage.OutputTokens, 10)
	}

	_, err := crossmessage.DefaultSVC().Edit(ctx, &msgEntity.Message{
		ID:  msg.ID,
		Ext: msg.Ext,
	})
	if err != nil {
		return err
	}

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageCompleted, msg, mh.sw)
	return nil
}

func (mh *MessageEventHandler) handlerInterrupt(ctx context.Context, chunk *entity.AgentRespEvent, rtDependence *AgentRuntime, firstAnswerMsg *msgEntity.Message, reasoningContent string) error {
	interruptData, cType, err := parseInterruptData(ctx, chunk.Interrupt)
	if err != nil {
		return err
	}
	preMsg, err := preCreateAnswer(ctx, rtDependence)
	if err != nil {
		return err
	}
	deltaAnswer := &entity.ChunkMessageItem{
		ID:             preMsg.ID,
		ConversationID: preMsg.ConversationID,
		SectionID:      preMsg.SectionID,
		RunID:          preMsg.RunID,
		AgentID:        preMsg.AgentID,
		Role:           entity.RoleType(preMsg.Role),
		Content:        interruptData,
		MessageType:    preMsg.MessageType,
		ContentType:    cType,
		ReplyID:        preMsg.RunID,
		Ext:            preMsg.Ext,
		IsFinish:       false,
	}

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageDelta, deltaAnswer, mh.sw)
	finalAnswer := deepcopy.Copy(deltaAnswer).(*entity.ChunkMessageItem)
	if len(reasoningContent) > 0 && firstAnswerMsg == nil {
		finalAnswer.ReasoningContent = ptr.Of(reasoningContent)
	}
	usage := func() *msgEntity.UsageExt {
		if rtDependence.GetUsage() != nil {
			return &msgEntity.UsageExt{
				TotalCount:   rtDependence.GetUsage().LlmTotalTokens,
				InputTokens:  rtDependence.GetUsage().LlmPromptTokens,
				OutputTokens: rtDependence.GetUsage().LlmCompletionTokens,
			}
		}
		return nil
	}

	err = mh.handlerAnswer(ctx, finalAnswer, usage(), rtDependence, preMsg)
	if err != nil {
		return err
	}

	err = mh.handlerInterruptVerbose(ctx, chunk, rtDependence)
	if err != nil {
		return err
	}
	return nil
}

func (mh *MessageEventHandler) handlerWfInterruptMsg(ctx context.Context, stateMsg *crossworkflow.StateMessage, rtDependence *AgentRuntime) {
	interruptData, cType, err := handlerWfInterruptEvent(ctx, stateMsg.InterruptEvent)
	if err != nil {
		return
	}
	preMsg, err := preCreateAnswer(ctx, rtDependence)
	if err != nil {
		return
	}
	deltaAnswer := &entity.ChunkMessageItem{
		ID:             preMsg.ID,
		ConversationID: preMsg.ConversationID,
		SectionID:      preMsg.SectionID,
		RunID:          preMsg.RunID,
		AgentID:        preMsg.AgentID,
		Role:           entity.RoleType(preMsg.Role),
		Content:        interruptData,
		MessageType:    preMsg.MessageType,
		ContentType:    cType,
		ReplyID:        preMsg.RunID,
		Ext:            preMsg.Ext,
		IsFinish:       false,
	}

	mh.messageEvent.SendMsgEvent(entity.RunEventMessageDelta, deltaAnswer, mh.sw)
	finalAnswer := deepcopy.Copy(deltaAnswer).(*entity.ChunkMessageItem)

	err = mh.handlerAnswer(ctx, finalAnswer, nil, rtDependence, preMsg)
	if err != nil {
		return
	}

	err = mh.handlerInterruptVerbose(ctx, &entity.AgentRespEvent{
		EventType: message.MessageTypeInterrupt,
		Interrupt: &singleagent.InterruptInfo{

			InterruptType:     singleagent.InterruptEventType(stateMsg.InterruptEvent.EventType),
			InterruptID:       strconv.FormatInt(stateMsg.InterruptEvent.ID, 10),
			ChatflowInterrupt: stateMsg,
		},
	}, rtDependence)
	if err != nil {
		return
	}
}

func (mh *MessageEventHandler) HandlerInput(ctx context.Context, rtDependence *AgentRuntime) (*msgEntity.Message, error) {
	msgMeta := buildAgentMessage2Create(ctx, nil, message.MessageTypeQuestion, rtDependence)

	cm, err := crossmessage.DefaultSVC().Create(ctx, msgMeta)
	if err != nil {
		return nil, err
	}

	ackErr := mh.handlerAckMessage(ctx, cm)
	if ackErr != nil {
		return msgMeta, ackErr
	}
	return cm, nil
}

func (mh *MessageEventHandler) ParseAdditionalMessages(ctx context.Context, rtDependence *AgentRuntime, runRecord *entity.RunRecordMeta) error {

	if len(rtDependence.GetRunMeta().AdditionalMessages) == 0 {
		return nil
	}

	additionalMessages := make([]*message.Message, 0, len(rtDependence.GetRunMeta().AdditionalMessages))

	for _, msg := range rtDependence.GetRunMeta().AdditionalMessages {
		cm := buildAdditionalMessage2Create(ctx, runRecord, msg, rtDependence.GetRunMeta().UserID)
		additionalMessages = append(additionalMessages, cm)
	}

	_, err := crossmessage.DefaultSVC().BatchCreate(ctx, additionalMessages)

	return err
}
