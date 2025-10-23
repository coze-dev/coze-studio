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
	"bytes"
	"context"
	"errors"
	"io"
	"sync"

	"github.com/cloudwego/eino/schema"
	"github.com/mohae/deepcopy"

	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (art *AgentRuntime) AgentStreamExecute(ctx context.Context, imagex imagex.ImageX) (err error) {
	mainChan := make(chan *entity.AgentRespEvent, 100)

	ar := &crossagent.AgentRuntime{
		AgentVersion:     art.GetRunMeta().Version,
		SpaceID:          art.GetRunMeta().SpaceID,
		AgentID:          art.GetRunMeta().AgentID,
		IsDraft:          art.GetRunMeta().IsDraft,
		UserID:           art.GetRunMeta().UserID,
		ConversationId:   art.GetRunMeta().ConversationID,
		ConnectorID:      art.GetRunMeta().ConnectorID,
		PreRetrieveTools: art.GetRunMeta().PreRetrieveTools,
		CustomVariables:  art.GetRunMeta().CustomVariables,
		Input:            transMessageToSchemaMessage(ctx, []*msgEntity.Message{art.GetInput()}, imagex)[0],
		HistoryMsg:       transMessageToSchemaMessage(ctx, historyPairs(art.GetHistory()), imagex),
		ResumeInfo:       parseResumeInfo(ctx, art.GetHistory()),
	}

	streamer, err := crossagent.DefaultSVC().StreamExecute(ctx, ar)
	if err != nil {
		return errors.New(errorx.ErrorWithoutStack(err))
	}

	var wg sync.WaitGroup
	wg.Add(2)
	safego.Go(ctx, func() {
		defer wg.Done()
		art.pull(ctx, mainChan, streamer)
	})

	safego.Go(ctx, func() {
		defer wg.Done()
		art.push(ctx, mainChan)
	})

	wg.Wait()

	return err
}

func (art *AgentRuntime) push(ctx context.Context, mainChan chan *entity.AgentRespEvent) {

	mh := &MessageEventHandler{
		sw:           art.SW,
		messageEvent: art.MessageEvent,
	}

	var err error
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "run.push error: %v", err)
			mh.handlerErr(ctx, err)
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

		if chunk.Err != nil {
			if errors.Is(chunk.Err, io.EOF) {
				if !isSendFinishAnswer {
					isSendFinishAnswer = true
					if firstAnswerMsg != nil && len(reasoningContent.String()) > 0 {
						art.saveReasoningContent(ctx, firstAnswerMsg, reasoningContent.String())
						reasoningContent.Reset()
					}

					finishErr := mh.handlerFinalAnswerFinish(ctx, art)
					if finishErr != nil {
						err = finishErr
						return
					}
				}
				return
			}
			mh.handlerErr(ctx, chunk.Err)
			return
		}

		switch chunk.EventType {
		case message.MessageTypeFunctionCall:
			if chunk.FuncCall != nil && chunk.FuncCall.ResponseMeta != nil {
				if usage := handlerUsage(chunk.FuncCall.ResponseMeta); usage != nil {
					art.SetUsage(&agentrun.Usage{
						LlmPromptTokens:     usage.InputTokens,
						LlmCompletionTokens: usage.OutputTokens,
						LlmTotalTokens:      usage.TotalCount,
					})
				}
			}
			err = mh.handlerFunctionCall(ctx, chunk, art)
			if err != nil {
				return
			}

			if preToolResponseMsg == nil {
				var cErr error
				preToolResponseMsg, cErr = preCreateAnswer(ctx, art)
				if cErr != nil {
					err = cErr
					return
				}
			}
		case message.MessageTypeToolResponse:
			err = mh.handlerTooResponse(ctx, chunk, art, preToolResponseMsg, toolResponseMsgContent.String())
			if err != nil {
				return
			}
			preToolResponseMsg = nil // reset
		case message.MessageTypeKnowledge:
			err = mh.handlerKnowledge(ctx, chunk, art)
			if err != nil {
				return
			}
		case message.MessageTypeToolMidAnswer:
			fullMidAnswerContent := bytes.NewBuffer([]byte{})
			var usage *msgEntity.UsageExt
			toolMidAnswerMsg, cErr := preCreateAnswer(ctx, art)

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
					toolMidAnswerMsg, cErr = preCreateAnswer(ctx, art)
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

				sendMidAnswerMsg := buildSendMsg(ctx, toolMidAnswerMsg, false, art)
				sendMidAnswerMsg.Content = streamMsg.Content
				toolResponseMsgContent.WriteString(streamMsg.Content)
				fullMidAnswerContent.WriteString(streamMsg.Content)

				art.MessageEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMidAnswerMsg, art.SW)

				if streamMsg != nil && streamMsg.ResponseMeta != nil {
					usage = handlerUsage(streamMsg.ResponseMeta)
				}

				if streamMsg.Extra["is_finish"] == true {
					preMsgIsFinish = true
					sendMidAnswerMsg := buildSendMsg(ctx, toolMidAnswerMsg, false, art)
					sendMidAnswerMsg.Content = fullMidAnswerContent.String()
					fullMidAnswerContent.Reset()
					hfErr := mh.handlerAnswer(ctx, sendMidAnswerMsg, usage, art, toolMidAnswerMsg)
					if hfErr != nil {
						err = hfErr
						return
					}
				}
			}

		case message.MessageTypeToolAsAnswer:
			var usage *msgEntity.UsageExt
			fullContent := bytes.NewBuffer([]byte{})
			toolAsAnswerMsg, cErr := preCreateAnswer(ctx, art)
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

						answer := buildSendMsg(ctx, toolAsAnswerMsg, false, art)
						answer.Content = fullContent.String()
						hfErr := mh.handlerAnswer(ctx, answer, usage, art, toolAsAnswerMsg)
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
					usage = handlerUsage(streamMsg.ResponseMeta)
				}
				sendMsg := buildSendMsg(ctx, toolAsAnswerMsg, false, art)
				fullContent.WriteString(streamMsg.Content)
				sendMsg.Content = streamMsg.Content
				art.MessageEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMsg, art.SW)
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
						answer := buildSendMsg(ctx, modelAnswerMsg, false, art)
						answer.Content = fullContent.String()
						hfErr := mh.handlerAnswer(ctx, answer, usage, art, modelAnswerMsg)
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
					usage = handlerUsage(streamMsg.ResponseMeta)
				}

				if streamMsg != nil && len(streamMsg.ReasoningContent) == 0 && len(streamMsg.Content) == 0 {
					continue
				}

				if len(streamMsg.ReasoningContent) > 0 {
					if reasoningMsg == nil {
						reasoningMsg, err = preCreateAnswer(ctx, art)
						if err != nil {
							return
						}
					}

					sendReasoningMsg := buildSendMsg(ctx, reasoningMsg, false, art)
					reasoningContent.WriteString(streamMsg.ReasoningContent)
					sendReasoningMsg.ReasoningContent = ptr.Of(streamMsg.ReasoningContent)
					art.MessageEvent.SendMsgEvent(entity.RunEventMessageDelta, sendReasoningMsg, art.SW)
				}
				if len(streamMsg.Content) > 0 {

					if modelAnswerMsg == nil {
						modelAnswerMsg, err = preCreateAnswer(ctx, art)
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

					sendAnswerMsg := buildSendMsg(ctx, modelAnswerMsg, false, art)
					fullContent.WriteString(streamMsg.Content)
					sendAnswerMsg.Content = streamMsg.Content
					art.MessageEvent.SendMsgEvent(entity.RunEventMessageDelta, sendAnswerMsg, art.SW)
				}
			}

		case message.MessageTypeFlowUp:
			if isSendFinishAnswer {

				if firstAnswerMsg != nil && len(reasoningContent.String()) > 0 {
					art.saveReasoningContent(ctx, firstAnswerMsg, reasoningContent.String())
				}

				isSendFinishAnswer = true
				finishErr := mh.handlerFinalAnswerFinish(ctx, art)
				if finishErr != nil {
					err = finishErr
					return
				}
			}

			err = mh.handlerSuggest(ctx, chunk, art)
			if err != nil {
				return
			}

		case message.MessageTypeInterrupt:
			err = mh.handlerInterrupt(ctx, chunk, art, firstAnswerMsg, reasoningContent.String())
			if err != nil {
				return
			}
		}
	}
}

func (art *AgentRuntime) pull(_ context.Context, mainChan chan *entity.AgentRespEvent, events *schema.StreamReader[*crossagent.AgentEvent]) {
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

func (art *AgentRuntime) saveReasoningContent(ctx context.Context, firstAnswerMsg *msgEntity.Message, reasoningContent string) {
	_, err := crossmessage.DefaultSVC().Edit(ctx, &message.Message{
		ID:               firstAnswerMsg.ID,
		ReasoningContent: reasoningContent,
	})
	if err != nil {
		logs.CtxInfof(ctx, "save reasoning content failed, err: %v", err)
	}
}
