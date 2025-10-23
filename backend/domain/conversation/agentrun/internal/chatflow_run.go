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
	"strconv"
	"strings"
	"sync"

	"github.com/cloudwego/eino/schema"

	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (art *AgentRuntime) ChatflowRun(ctx context.Context, imagex imagex.ImageX) (err error) {

	mh := &MessageEventHandler{
		sw:           art.SW,
		messageEvent: art.MessageEvent,
	}
	resumeInfo := parseResumeInfo(ctx, art.GetHistory())
	wfID, _ := strconv.ParseInt(art.GetAgentInfo().LayoutInfo.WorkflowId, 10, 64)

	if wfID == 0 {
		mh.handlerErr(ctx, errorx.New(errno.ErrAgentRunWorkflowNotFound))
		return
	}
	var wfStreamer *schema.StreamReader[*crossworkflow.WorkflowMessage]

	executeConfig := crossworkflow.ExecuteConfig{
		ID:           wfID,
		ConnectorID:  art.GetRunMeta().ConnectorID,
		ConnectorUID: art.GetRunMeta().UserID,
		AgentID:      ptr.Of(art.GetRunMeta().AgentID),
		Mode:         crossworkflow.ExecuteModeRelease,
		BizType:      crossworkflow.BizTypeAgent,
		SyncPattern:  crossworkflow.SyncPatternStream,
		From:         crossworkflow.FromLatestVersion,
	}

	if resumeInfo != nil {
		wfStreamer, err = crossworkflow.DefaultSVC().StreamResume(ctx, &crossworkflow.ResumeRequest{
			ResumeData: concatWfInput(art),
			EventID:    resumeInfo.ChatflowInterrupt.InterruptEvent.ID,
			ExecuteID:  resumeInfo.ChatflowInterrupt.ExecuteID,
		}, executeConfig)
	} else {
		executeConfig.ConversationID = &art.GetRunMeta().ConversationID
		executeConfig.SectionID = &art.GetRunMeta().SectionID
		executeConfig.InitRoundID = &art.RunRecord.ID
		executeConfig.RoundID = &art.RunRecord.ID
		executeConfig.UserMessage = transMessageToSchemaMessage(ctx, []*msgEntity.Message{art.GetInput()}, imagex)[0]
		executeConfig.MaxHistoryRounds = ptr.Of(getAgentHistoryRounds(art.GetAgentInfo()))
		chatInput := map[string]any{
			"USER_INPUT": concatWfInput(art),
		}
		if art.GetRunMeta().ChatflowParameters != nil {
			for k, v := range art.GetRunMeta().ChatflowParameters {
				chatInput[k] = v
			}
		}
		wfStreamer, err = crossworkflow.DefaultSVC().StreamExecute(ctx, executeConfig, chatInput)
	}
	if err != nil {
		return err
	}

	var wg sync.WaitGroup
	wg.Add(1)
	safego.Go(ctx, func() {
		defer wg.Done()
		art.pullWfStream(ctx, wfStreamer, mh)
	})
	wg.Wait()
	return err
}

func concatWfInput(rtDependence *AgentRuntime) string {
	var input string
	for _, content := range rtDependence.RunMeta.Content {
		if content.Type == message.InputTypeText {
			input = content.Text + "," + input
		} else {
			for _, file := range content.FileData {
				input += file.Url + ","
			}
		}
	}
	return strings.Trim(input, ",")
}

func (art *AgentRuntime) pullWfStream(ctx context.Context, events *schema.StreamReader[*crossworkflow.WorkflowMessage], mh *MessageEventHandler) {

	fullAnswerContent := bytes.NewBuffer([]byte{})
	var usage *msgEntity.UsageExt

	preAnswerMsg, cErr := preCreateAnswer(ctx, art)

	if cErr != nil {
		return
	}

	var preMsgIsFinish = false
	var lastAnswerMsg *entity.ChunkMessageItem

	for {
		st, re := events.Recv()
		if re != nil {
			if errors.Is(re, io.EOF) {

				if lastAnswerMsg != nil && usage != nil {
					art.SetUsage(&agentrun.Usage{
						LlmPromptTokens:     usage.InputTokens,
						LlmCompletionTokens: usage.OutputTokens,
						LlmTotalTokens:      usage.TotalCount,
					})
					_ = mh.handlerWfUsage(ctx, lastAnswerMsg, usage)
				}

				finishErr := mh.handlerFinalAnswerFinish(ctx, art)
				if finishErr != nil {
					logs.CtxErrorf(ctx, "handlerFinalAnswerFinish error: %v", finishErr)
					return
				}
				return
			}
			logs.CtxErrorf(ctx, "pullWfStream Recv error: %v", re)
			mh.handlerErr(ctx, re)
			return
		}
		if st == nil {
			continue
		}
		if st.StateMessage != nil {
			if st.StateMessage.Status == crossworkflow.WorkflowFailed {
				mh.handlerErr(ctx, st.StateMessage.LastError)
				continue
			}
			if st.StateMessage.Usage != nil {
				usage = &msgEntity.UsageExt{
					InputTokens:  st.StateMessage.Usage.InputTokens,
					OutputTokens: st.StateMessage.Usage.OutputTokens,
					TotalCount:   st.StateMessage.Usage.InputTokens + st.StateMessage.Usage.OutputTokens,
				}
			}

			if st.StateMessage.InterruptEvent != nil { // interrupt
				mh.handlerWfInterruptMsg(ctx, st.StateMessage, art)
				continue
			}

		}

		if st.DataMessage == nil {
			continue
		}

		switch st.DataMessage.Type {
		case crossworkflow.Answer:

			// input node & question node skip
			if st.DataMessage != nil && (st.DataMessage.NodeType == crossworkflow.NodeTypeInputReceiver || st.DataMessage.NodeType == crossworkflow.NodeTypeQuestion) {
				break
			}

			if preMsgIsFinish {
				preAnswerMsg, cErr = preCreateAnswer(ctx, art)
				if cErr != nil {
					return
				}
				preMsgIsFinish = false
			}
			if st.DataMessage.Content != "" {
				fullAnswerContent.WriteString(st.DataMessage.Content)
			}

			sendAnswerMsg := buildSendMsg(ctx, preAnswerMsg, false, art)
			sendAnswerMsg.Content = st.DataMessage.Content

			mh.messageEvent.SendMsgEvent(entity.RunEventMessageDelta, sendAnswerMsg, mh.sw)

			if st.DataMessage.Last {
				preMsgIsFinish = true
				sendAnswerMsg := buildSendMsg(ctx, preAnswerMsg, false, art)
				sendAnswerMsg.Content = fullAnswerContent.String()
				fullAnswerContent.Reset()
				hfErr := mh.handlerAnswer(ctx, sendAnswerMsg, usage, art, preAnswerMsg)
				if hfErr != nil {
					return
				}
				lastAnswerMsg = sendAnswerMsg
			}
		}
	}
}
