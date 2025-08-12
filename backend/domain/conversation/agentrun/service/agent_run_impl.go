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

package agentrun

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/mohae/deepcopy"

	messageModel "github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agent"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/contract/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type runImpl struct {
	Components

	runProcess *internal.RunProcess
	runEvent   *internal.Event
}

type runtimeDependence struct {
	runID         int64
	agentInfo     *singleagent.SingleAgent
	questionMsgID int64
	runMeta       *entity.AgentRunMeta
	startTime     time.Time

	usage *agentrun.Usage
}

type Components struct {
	RunRecordRepo repository.RunRecordRepo
}

func NewService(c *Components) Run {
	return &runImpl{
		Components: *c,
		runEvent:   internal.NewEvent(),
		runProcess: internal.NewRunProcess(c.RunRecordRepo),
	}
}

func (c *runImpl) AgentRun(ctx context.Context, arm *entity.AgentRunMeta) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	sr, sw := schema.Pipe[*entity.AgentRunResponse](20)

	defer func() {
		if pe := recover(); pe != nil {
			logs.CtxErrorf(ctx, "panic recover: %v\n, [stack]:%v", pe, string(debug.Stack()))
			return
		}
	}()

	rtDependence := &runtimeDependence{
		runMeta:   arm,
		startTime: time.Now(),
	}

	safego.Go(ctx, func() {
		defer sw.Close()
		_ = c.run(ctx, sw, rtDependence)
	})

	return sr, nil
}

func (c *runImpl) run(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) (err error) {

	agentInfo, err := c.handlerAgent(ctx, rtDependence)
	if err != nil {
		return
	}

	rtDependence.agentInfo = agentInfo

	history, err := c.handlerHistory(ctx, rtDependence)
	if err != nil {
		return
	}

	runRecord, err := c.createRunRecord(ctx, sw, rtDependence)

	if err != nil {
		return
	}
	rtDependence.runID = runRecord.ID
	defer func() {
		srRecord := c.buildSendRunRecord(ctx, runRecord, entity.RunStatusCompleted)
		if err != nil {
			srRecord.Error = &entity.RunError{
				Code: errno.ErrConversationAgentRunError,
				Msg:  err.Error(),
			}
			c.runProcess.StepToFailed(ctx, srRecord, sw)
			return
		}
		c.runProcess.StepToComplete(ctx, srRecord, sw, rtDependence.usage)
	}()

	input, err := c.handlerInput(ctx, sw, rtDependence)
	if err != nil {
		return
	}

	rtDependence.questionMsgID = input.ID

	err = c.handlerStreamExecute(ctx, sw, history, input, rtDependence)
	return
}

func (c *runImpl) handlerAgent(ctx context.Context, rtDependence *runtimeDependence) (*singleagent.SingleAgent, error) {
	agentInfo, err := crossagent.DefaultSVC().ObtainAgentByIdentity(ctx, &singleagent.AgentIdentity{
		AgentID: rtDependence.runMeta.AgentID,
		IsDraft: rtDependence.runMeta.IsDraft,
	})
	if err != nil {
		return nil, err
	}

	return agentInfo, nil
}

func (c *runImpl) handlerStreamExecute(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], historyMsg []*msgEntity.Message, input *msgEntity.Message, rtDependence *runtimeDependence) (err error) {
	mainChan := make(chan *entity.AgentRespEvent, 100)

	ar := &singleagent.AgentRuntime{
		AgentVersion:     rtDependence.runMeta.Version,
		SpaceID:          rtDependence.runMeta.SpaceID,
		IsDraft:          rtDependence.runMeta.IsDraft,
		ConnectorID:      rtDependence.runMeta.ConnectorID,
		PreRetrieveTools: rtDependence.runMeta.PreRetrieveTools,
	}

	streamer, err := crossagent.DefaultSVC().StreamExecute(ctx, historyMsg, input, ar)
	if err != nil {
		return errors.New(errorx.ErrorWithoutStack(err))
	}

	var wg sync.WaitGroup
	wg.Add(2)
	safego.Go(ctx, func() {
		defer wg.Done()
		c.pull(ctx, mainChan, streamer)
	})

	safego.Go(ctx, func() {
		defer wg.Done()
		c.push(ctx, mainChan, sw, rtDependence)
	})

	wg.Wait()

	return err
}

func transformEventMap(eventType singleagent.EventType) (message.MessageType, error) {
	var eType message.MessageType
	switch eventType {
	case singleagent.EventTypeOfFuncCall:
		return message.MessageTypeFunctionCall, nil
	case singleagent.EventTypeOfKnowledge:
		return message.MessageTypeKnowledge, nil
	case singleagent.EventTypeOfToolsMessage:
		return message.MessageTypeToolResponse, nil
	case singleagent.EventTypeOfChatModelAnswer:
		return message.MessageTypeAnswer, nil
	case singleagent.EventTypeOfToolsAsChatModelStream:
		return message.MessageTypeToolAsAnswer, nil
	case singleagent.EventTypeOfToolMidAnswer:
		return message.MessageTypeToolMidAnswer, nil
	case singleagent.EventTypeOfSuggest:
		return message.MessageTypeFlowUp, nil
	case singleagent.EventTypeOfInterrupt:
		return message.MessageTypeInterrupt, nil
	}
	return eType, errorx.New(errno.ErrReplyUnknowEventType)
}

func (c *runImpl) buildAgentMessage2Create(ctx context.Context, chunk *entity.AgentRespEvent, messageType message.MessageType, rtDependence *runtimeDependence) *message.Message {
	arm := rtDependence.runMeta
	msg := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          rtDependence.runID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		MessageType:    messageType,
	}
	buildExt := map[string]string{}

	timeCost := fmt.Sprintf("%.1f", float64(time.Since(rtDependence.startTime).Milliseconds())/1000.00)

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

		knowledgeContent := c.buildKnowledge(ctx, chunk)
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
		botStateExt := c.buildBotStateExt(arm)
		bseString, err := json.Marshal(botStateExt)
		if err == nil {
			buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
		}
	}
	msg.Ext = buildExt
	return msg
}

func (c *runImpl) handlerHistory(ctx context.Context, rtDependence *runtimeDependence) ([]*msgEntity.Message, error) {

	conversationTurns := entity.ConversationTurnsDefault

	if rtDependence.agentInfo != nil && rtDependence.agentInfo.ModelInfo != nil && rtDependence.agentInfo.ModelInfo.ShortMemoryPolicy != nil && ptr.From(rtDependence.agentInfo.ModelInfo.ShortMemoryPolicy.HistoryRound) > 0 {
		conversationTurns = ptr.From(rtDependence.agentInfo.ModelInfo.ShortMemoryPolicy.HistoryRound)
	}

	runRecordList, err := c.RunRecordRepo.List(ctx, rtDependence.runMeta.ConversationID, rtDependence.runMeta.SectionID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(runRecordList) == 0 {
		return nil, nil
	}

	runIDS := c.getRunID(runRecordList)

	history, err := crossmessage.DefaultSVC().GetByRunIDs(ctx, rtDependence.runMeta.ConversationID, runIDS)
	if err != nil {
		return nil, err
	}

	return history, nil
}

func (c *runImpl) getRunID(rr []*model.RunRecord) []int64 {
	ids := make([]int64, 0, len(rr))
	for _, c := range rr {
		ids = append(ids, c.ID)
	}

	return ids
}

func (c *runImpl) createRunRecord(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) (*entity.RunRecordMeta, error) {
	runPoData, err := c.RunRecordRepo.Create(ctx, rtDependence.runMeta)
	if err != nil {
		logs.CtxErrorf(ctx, "RunRecordRepo.Create error: %v", err)
		return nil, err
	}

	srRecord := c.buildSendRunRecord(ctx, runPoData, entity.RunStatusCreated)

	c.runProcess.StepToCreate(ctx, srRecord, sw)

	err = c.runProcess.StepToInProgress(ctx, srRecord, sw)
	if err != nil {
		logs.CtxErrorf(ctx, "runProcess.StepToInProgress error: %v", err)
		return nil, err
	}

	return runPoData, nil
}

func (c *runImpl) handlerInput(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) (*msgEntity.Message, error) {
	msgMeta := c.buildAgentMessage2Create(ctx, nil, message.MessageTypeQuestion, rtDependence)

	cm, err := crossmessage.DefaultSVC().Create(ctx, msgMeta)
	if err != nil {
		return nil, err
	}

	ackErr := c.handlerAckMessage(ctx, cm, sw)
	if ackErr != nil {
		return msgMeta, ackErr
	}
	return cm, nil
}

func (c *runImpl) pull(_ context.Context, mainChan chan *entity.AgentRespEvent, events *schema.StreamReader[*crossagent.AgentEvent]) {
	defer func() {
		close(mainChan)
	}()

	for {
		rm, re := events.Recv()
		if re != nil {
			errChunk := &entity.AgentRespEvent{
				Err: re,
			}
			mainChan <- errChunk
			return
		}

		eventType, tErr := transformEventMap(rm.EventType)

		if tErr != nil {
			errChunk := &entity.AgentRespEvent{
				Err: tErr,
			}
			mainChan <- errChunk
			return
		}

		respChunk := &entity.AgentRespEvent{
			EventType:    eventType,
			ModelAnswer:  rm.ChatModelAnswer,
			ToolsMessage: rm.ToolsMessage,
			FuncCall:     rm.FuncCall,
			Knowledge:    rm.Knowledge,
			Suggest:      rm.Suggest,
			Interrupt:    rm.Interrupt,

			ToolMidAnswer: rm.ToolMidAnswer,
			ToolAsAnswer:  rm.ToolAsChatModelAnswer,
		}

		mainChan <- respChunk
	}
}

func (c *runImpl) push(ctx context.Context, mainChan chan *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) {

	var err error
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "run.push error: %v", err)
			c.handlerErr(ctx, err, sw)
		}
	}()

	reasoningContent := bytes.NewBuffer([]byte{})

	var firstAnswerMsg *msgEntity.Message
	var reasoningMsg *msgEntity.Message
	isSendFinishAnswer := false
	var preToolResponseMsg *msgEntity.Message
	toolResponseMsgContent := bytes.NewBuffer([]byte{})
	for {
		chunk, ok := <-mainChan
		if !ok || chunk == nil {
			return
		}
		logs.CtxInfof(ctx, "hanlder event:%v,err:%v", conv.DebugJsonToStr(chunk), chunk.Err)
		if chunk.Err != nil {
			if errors.Is(chunk.Err, io.EOF) {
				if !isSendFinishAnswer {
					isSendFinishAnswer = true
					if firstAnswerMsg != nil && len(reasoningContent.String()) > 0 {
						c.saveReasoningContent(ctx, firstAnswerMsg, reasoningContent.String())
						reasoningContent.Reset()
					}

					finishErr := c.handlerFinalAnswerFinish(ctx, sw, rtDependence)
					if finishErr != nil {
						err = finishErr
						return
					}
				}
				return
			}
			c.handlerErr(ctx, chunk.Err, sw)
			return
		}

		switch chunk.EventType {
		case message.MessageTypeFunctionCall:
			err = c.handlerFunctionCall(ctx, chunk, sw, rtDependence)
			if err != nil {
				return
			}

			if preToolResponseMsg == nil {
				var cErr error
				preToolResponseMsg, cErr = c.PreCreateAnswer(ctx, rtDependence)
				if cErr != nil {
					err = cErr
					return
				}
			}
		case message.MessageTypeToolResponse:
			err = c.handlerTooResponse(ctx, chunk, sw, rtDependence, preToolResponseMsg, toolResponseMsgContent.String())
			if err != nil {
				return
			}
			preToolResponseMsg = nil // reset
		case message.MessageTypeKnowledge:
			err = c.handlerKnowledge(ctx, chunk, sw, rtDependence)
			if err != nil {
				return
			}
		case message.MessageTypeToolMidAnswer:
			fullMidAnswerContent := bytes.NewBuffer([]byte{})
			var usage *msgEntity.UsageExt
			toolMidAnswerMsg, cErr := c.PreCreateAnswer(ctx, rtDependence)

			if cErr != nil {
				err = cErr
				return
			}

			var preMsgIsFinish = false
			for {
				streamMsg, receErr := chunk.ToolMidAnswer.Recv()
				if receErr != nil {
					if errors.Is(receErr, io.EOF) {
						break
					}
					err = receErr
					return
				}
				if preMsgIsFinish {
					toolMidAnswerMsg, cErr = c.PreCreateAnswer(ctx, rtDependence)
					if cErr != nil {
						err = cErr
						return
					}
					preMsgIsFinish = false
				}
				if streamMsg == nil {
					continue
				}
				if firstAnswerMsg == nil && len(streamMsg.Content) > 0 {
					if reasoningMsg != nil {
						toolMidAnswerMsg = deepcopy.Copy(reasoningMsg).(*msgEntity.Message)
					}
					firstAnswerMsg = deepcopy.Copy(toolMidAnswerMsg).(*msgEntity.Message)
				}

				if streamMsg.Extra != nil {
					if val, ok := streamMsg.Extra["workflow_node_name"]; ok && val != nil {
						toolMidAnswerMsg.Ext["message_title"] = val.(string)
					}
				}

				sendMidAnswerMsg := c.buildSendMsg(ctx, toolMidAnswerMsg, false, rtDependence)
				sendMidAnswerMsg.Content = streamMsg.Content
				toolResponseMsgContent.WriteString(streamMsg.Content)
				fullMidAnswerContent.WriteString(streamMsg.Content)

				c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMidAnswerMsg, sw)

				if streamMsg != nil && streamMsg.ResponseMeta != nil {
					usage = c.handlerUsage(streamMsg.ResponseMeta)
				}

				if streamMsg.Extra["is_finish"] == true {
					preMsgIsFinish = true
					sendMidAnswerMsg := c.buildSendMsg(ctx, toolMidAnswerMsg, false, rtDependence)
					sendMidAnswerMsg.Content = fullMidAnswerContent.String()
					fullMidAnswerContent.Reset()
					hfErr := c.handlerAnswer(ctx, sendMidAnswerMsg, sw, usage, rtDependence, toolMidAnswerMsg)
					if hfErr != nil {
						err = hfErr
						return
					}
				}
			}

		case message.MessageTypeToolAsAnswer:
			var usage *msgEntity.UsageExt
			fullContent := bytes.NewBuffer([]byte{})
			toolAsAnswerMsg, cErr := c.PreCreateAnswer(ctx, rtDependence)
			if cErr != nil {
				err = cErr
				return
			}
			if firstAnswerMsg == nil {
				firstAnswerMsg = toolAsAnswerMsg
			}

			for {
				streamMsg, receErr := chunk.ToolAsAnswer.Recv()
				if receErr != nil {
					if errors.Is(receErr, io.EOF) {

						answer := c.buildSendMsg(ctx, toolAsAnswerMsg, false, rtDependence)
						answer.Content = fullContent.String()
						hfErr := c.handlerAnswer(ctx, answer, sw, usage, rtDependence, toolAsAnswerMsg)
						if hfErr != nil {
							err = hfErr
							return
						}
						break
					}
					err = receErr
					return
				}

				if streamMsg != nil && streamMsg.ResponseMeta != nil {
					usage = c.handlerUsage(streamMsg.ResponseMeta)
				}
				sendMsg := c.buildSendMsg(ctx, toolAsAnswerMsg, false, rtDependence)
				fullContent.WriteString(streamMsg.Content)
				sendMsg.Content = streamMsg.Content
				c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMsg, sw)
			}

		case message.MessageTypeAnswer:
			fullContent := bytes.NewBuffer([]byte{})
			var usage *msgEntity.UsageExt
			var isToolCalls = false
			var modelAnswerMsg *msgEntity.Message
			for {
				streamMsg, receErr := chunk.ModelAnswer.Recv()
				if receErr != nil {
					if errors.Is(receErr, io.EOF) {

						if isToolCalls {
							break
						}
						if modelAnswerMsg == nil {
							break
						}
						answer := c.buildSendMsg(ctx, modelAnswerMsg, false, rtDependence)
						answer.Content = fullContent.String()
						hfErr := c.handlerAnswer(ctx, answer, sw, usage, rtDependence, modelAnswerMsg)
						if hfErr != nil {
							err = hfErr
							return
						}
						break
					}
					err = receErr
					return
				}

				if streamMsg != nil && len(streamMsg.ToolCalls) > 0 {
					isToolCalls = true
				}

				if streamMsg != nil && streamMsg.ResponseMeta != nil {
					usage = c.handlerUsage(streamMsg.ResponseMeta)
				}

				if streamMsg != nil && len(streamMsg.ReasoningContent) == 0 && len(streamMsg.Content) == 0 {
					continue
				}

				if len(streamMsg.ReasoningContent) > 0 {
					if reasoningMsg == nil {
						reasoningMsg, err = c.PreCreateAnswer(ctx, rtDependence)
						if err != nil {
							return
						}
					}

					sendReasoningMsg := c.buildSendMsg(ctx, reasoningMsg, false, rtDependence)
					reasoningContent.WriteString(streamMsg.ReasoningContent)
					sendReasoningMsg.ReasoningContent = ptr.Of(streamMsg.ReasoningContent)
					c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendReasoningMsg, sw)
				}
				if len(streamMsg.Content) > 0 {

					if modelAnswerMsg == nil {
						modelAnswerMsg, err = c.PreCreateAnswer(ctx, rtDependence)
						if err != nil {
							return
						}
						if firstAnswerMsg == nil {
							if reasoningMsg != nil {
								modelAnswerMsg.ID = reasoningMsg.ID
							}
							firstAnswerMsg = modelAnswerMsg
						}
					}

					sendAnswerMsg := c.buildSendMsg(ctx, modelAnswerMsg, false, rtDependence)
					fullContent.WriteString(streamMsg.Content)
					sendAnswerMsg.Content = streamMsg.Content
					c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendAnswerMsg, sw)
				}
			}

		case message.MessageTypeFlowUp:
			if isSendFinishAnswer {

				if firstAnswerMsg != nil && len(reasoningContent.String()) > 0 {
					c.saveReasoningContent(ctx, firstAnswerMsg, reasoningContent.String())
				}

				isSendFinishAnswer = true
				finishErr := c.handlerFinalAnswerFinish(ctx, sw, rtDependence)
				if finishErr != nil {
					err = finishErr
					return
				}
			}

			err = c.handlerSuggest(ctx, chunk, sw, rtDependence)
			if err != nil {
				return
			}

		case message.MessageTypeInterrupt:
			err = c.handlerInterrupt(ctx, chunk, sw, rtDependence, firstAnswerMsg, reasoningContent.String())
			if err != nil {
				return
			}
		}
	}
}

func (c *runImpl) saveReasoningContent(ctx context.Context, firstAnswerMsg *msgEntity.Message, reasoningContent string) {
	_, err := crossmessage.DefaultSVC().Edit(ctx, &message.Message{
		ID:               firstAnswerMsg.ID,
		ReasoningContent: reasoningContent,
	})
	if err != nil {
		logs.CtxInfof(ctx, "save reasoning content failed, err: %v", err)
	}
}

func (c *runImpl) handlerInterrupt(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence, firstAnswerMsg *msgEntity.Message, reasoningCOntent string) error {
	interruptData, cType, err := c.parseInterruptData(ctx, chunk.Interrupt)
	if err != nil {
		return err
	}
	preMsg, err := c.PreCreateAnswer(ctx, rtDependence)
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

	c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, deltaAnswer, sw)
	finalAnswer := deepcopy.Copy(deltaAnswer).(*entity.ChunkMessageItem)
	if len(reasoningCOntent) > 0 && firstAnswerMsg == nil {
		finalAnswer.ReasoningContent = ptr.Of(reasoningCOntent)
	}
	err = c.handlerAnswer(ctx, finalAnswer, sw, nil, rtDependence, preMsg)
	if err != nil {
		return err
	}

	err = c.handlerInterruptVerbose(ctx, chunk, sw, rtDependence)
	if err != nil {
		return err
	}
	return nil
}

func (c *runImpl) parseInterruptData(_ context.Context, interruptData *singleagent.InterruptInfo) (string, message.ContentType, error) {

	type msg struct {
		Type        string `json:"type,omitempty"`
		ContentType string `json:"content_type"`
		Content     any    `json:"content"` // either optionContent or string
		ID          string `json:"id,omitempty"`
	}

	defaultContentType := message.ContentTypeText
	switch interruptData.InterruptType {
	case singleagent.InterruptEventType_OauthPlugin:
		data := interruptData.AllToolInterruptData[interruptData.ToolCallID].ToolNeedOAuth.Message
		return data, defaultContentType, nil
	case singleagent.InterruptEventType_Question:
		var iData map[string][]*msg
		err := json.Unmarshal([]byte(interruptData.AllWfInterruptData[interruptData.ToolCallID].InterruptData), &iData)
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
	case singleagent.InterruptEventType_InputNode:
		data := interruptData.AllWfInterruptData[interruptData.ToolCallID].InterruptData
		return data, message.ContentTypeCard, nil
	case singleagent.InterruptEventType_WorkflowLLM:
		toolInterruptEvent := interruptData.AllWfInterruptData[interruptData.ToolCallID].ToolInterruptEvent
		data := toolInterruptEvent.InterruptData
		if singleagent.InterruptEventType(toolInterruptEvent.EventType) == singleagent.InterruptEventType_InputNode {
			return data, message.ContentTypeCard, nil
		}
		if singleagent.InterruptEventType(toolInterruptEvent.EventType) == singleagent.InterruptEventType_Question {
			var iData map[string][]*msg
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
		}
		return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)

	}
	return "", defaultContentType, errorx.New(errno.ErrUnknowInterruptType)
}

func (c *runImpl) handlerUsage(meta *schema.ResponseMeta) *msgEntity.UsageExt {
	if meta == nil || meta.Usage == nil {
		return nil
	}

	return &msgEntity.UsageExt{
		TotalCount:   int64(meta.Usage.TotalTokens),
		InputTokens:  int64(meta.Usage.PromptTokens),
		OutputTokens: int64(meta.Usage.CompletionTokens),
	}
}

func (c *runImpl) handlerErr(_ context.Context, err error, sw *schema.StreamWriter[*entity.AgentRunResponse]) {

	errMsg := errorx.ErrorWithoutStack(err)
	if strings.ToLower(os.Getenv(consts.RunMode)) != "debug" {
		var statusErr errorx.StatusError
		if errors.As(err, &statusErr) {
			errMsg = statusErr.Msg()
		} else {
			errMsg = "Internal Server Error"
		}
	}
	c.runEvent.SendErrEvent(entity.RunEventError, sw, &entity.RunError{
		Code: errno.ErrAgentRun,
		Msg:  errMsg,
	})
}

func (c *runImpl) PreCreateAnswer(ctx context.Context, rtDependence *runtimeDependence) (*msgEntity.Message, error) {
	arm := rtDependence.runMeta
	msgMeta := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          rtDependence.runID,
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

	botStateExt := c.buildBotStateExt(arm)
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

func (c *runImpl) handlerAnswer(ctx context.Context, msg *entity.ChunkMessageItem, sw *schema.StreamWriter[*entity.AgentRunResponse], usage *msgEntity.UsageExt, rtDependence *runtimeDependence, preAnswerMsg *msgEntity.Message) error {

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

		rtDependence.usage = &agentrun.Usage{
			LlmPromptTokens:     usage.InputTokens,
			LlmCompletionTokens: usage.OutputTokens,
			LlmTotalTokens:      usage.TotalCount,
		}
	}

	if _, ok := msg.Ext[string(msgEntity.MessageExtKeyTimeCost)]; !ok {
		msg.Ext[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(rtDependence.startTime).Milliseconds())/1000.00)
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
	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, msg, sw)

	return nil
}

func (c *runImpl) buildBotStateExt(arm *entity.AgentRunMeta) *msgEntity.BotStateExt {
	agentID := strconv.FormatInt(arm.AgentID, 10)
	botStateExt := &msgEntity.BotStateExt{
		AgentID:   agentID,
		AgentName: arm.Name,
		Awaiting:  agentID,
		BotID:     agentID,
	}

	return botStateExt
}

func (c *runImpl) handlerFunctionCall(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, message.MessageTypeFunctionCall, rtDependence)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) handlerAckMessage(_ context.Context, input *msgEntity.Message, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
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

	c.runEvent.SendMsgEvent(entity.RunEventAck, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerTooResponse(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence, preToolResponseMsg *msgEntity.Message, toolResponseMsgContent string) error {

	cm := c.buildAgentMessage2Create(ctx, chunk, message.MessageTypeToolResponse, rtDependence)

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

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerSuggest(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, message.MessageTypeFlowUp, rtDependence)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerKnowledge(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, message.MessageTypeKnowledge, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) buildKnowledge(_ context.Context, chunk *entity.AgentRespEvent) *msgEntity.VerboseInfo {
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

func (c *runImpl) handlerFinalAnswerFinish(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) error {
	cm := c.buildAgentMessage2Create(ctx, nil, message.MessageTypeVerbose, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) handlerInterruptVerbose(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], rtDependence *runtimeDependence) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, message.MessageTypeInterrupt, rtDependence)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true, rtDependence)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) buildSendMsg(_ context.Context, msg *msgEntity.Message, isFinish bool, rtDependence *runtimeDependence) *entity.ChunkMessageItem {

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
		ReplyID:          rtDependence.questionMsgID,
		Type:             msg.MessageType,
		CreatedAt:        msg.CreatedAt,
		UpdatedAt:        msg.UpdatedAt,
		RunID:            rtDependence.runID,
		Ext:              copyMap,
		IsFinish:         isFinish,
		ReasoningContent: ptr.Of(msg.ReasoningContent),
	}
}

func (c *runImpl) buildSendRunRecord(_ context.Context, runRecord *entity.RunRecordMeta, runStatus entity.RunStatus) *entity.ChunkRunItem {
	return &entity.ChunkRunItem{
		ID:             runRecord.ID,
		ConversationID: runRecord.ConversationID,
		AgentID:        runRecord.AgentID,
		SectionID:      runRecord.SectionID,
		Status:         runStatus,
		CreatedAt:      runRecord.CreatedAt,
	}
}

func (c *runImpl) Delete(ctx context.Context, runID []int64) error {
	return c.RunRecordRepo.Delete(ctx, runID)
}
