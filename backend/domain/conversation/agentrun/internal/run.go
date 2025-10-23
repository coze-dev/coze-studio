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
	"time"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type AgentRuntime struct {
	RunRecord     *entity.RunRecordMeta
	AgentInfo     *singleagent.SingleAgent
	QuestionMsgID int64
	RunMeta       *entity.AgentRunMeta
	StartTime     time.Time
	Input         *msgEntity.Message
	HistoryMsg    []*msgEntity.Message
	Usage         *agentrun.Usage
	SW            *schema.StreamWriter[*entity.AgentRunResponse]

	RunProcess    *RunProcess
	RunRecordRepo repository.RunRecordRepo
	ImagexClient  imagex.ImageX
	MessageEvent  *Event
}

func (rd *AgentRuntime) SetRunRecord(runRecord *entity.RunRecordMeta) {
	rd.RunRecord = runRecord
}

func (rd *AgentRuntime) GetRunRecord() *entity.RunRecordMeta {
	return rd.RunRecord
}

func (rd *AgentRuntime) SetUsage(usage *agentrun.Usage) {
	rd.Usage = usage
}
func (rd *AgentRuntime) GetUsage() *agentrun.Usage {
	return rd.Usage
}

func (rd *AgentRuntime) SetRunMeta(arm *entity.AgentRunMeta) {
	rd.RunMeta = arm
}
func (rd *AgentRuntime) GetRunMeta() *entity.AgentRunMeta {
	return rd.RunMeta
}
func (rd *AgentRuntime) SetAgentInfo(agentInfo *singleagent.SingleAgent) {
	rd.AgentInfo = agentInfo
}
func (rd *AgentRuntime) GetAgentInfo() *singleagent.SingleAgent {
	return rd.AgentInfo
}
func (rd *AgentRuntime) SetQuestionMsgID(msgID int64) {
	rd.QuestionMsgID = msgID
}
func (rd *AgentRuntime) GetQuestionMsgID() int64 {
	return rd.QuestionMsgID
}
func (rd *AgentRuntime) SetStartTime(t time.Time) {
	rd.StartTime = t
}
func (rd *AgentRuntime) GetStartTime() time.Time {
	return rd.StartTime
}
func (rd *AgentRuntime) SetInput(input *msgEntity.Message) {
	rd.Input = input
}
func (rd *AgentRuntime) GetInput() *msgEntity.Message {
	return rd.Input
}

func (rd *AgentRuntime) SetHistoryMsg(histroyMsg []*msgEntity.Message) {
	rd.HistoryMsg = histroyMsg
}

func (rd *AgentRuntime) GetHistory() []*msgEntity.Message {
	return rd.HistoryMsg
}

func (art *AgentRuntime) Run(ctx context.Context) (err error) {

	mh := &MessageEventHandler{
		messageEvent: art.MessageEvent,
		sw:           art.SW,
	}

	agentInfo, err := getAgentInfo(ctx, art.GetRunMeta().AgentID, art.GetRunMeta().IsDraft, art.GetRunMeta().ConnectorID)
	if err != nil {
		return
	}

	art.SetAgentInfo(agentInfo)

	if len(art.GetRunMeta().AdditionalMessages) > 0 {
		var additionalRunRecord *entity.RunRecordMeta
		additionalRunRecord, err = art.RunRecordRepo.Create(ctx, art.GetRunMeta())
		if err != nil {
			return
		}
		err = mh.ParseAdditionalMessages(ctx, art, additionalRunRecord)
		if err != nil {
			return
		}
	}

	history, err := art.getHistory(ctx)
	if err != nil {
		return
	}

	runRecord, err := art.createRunRecord(ctx)

	if err != nil {
		return
	}

	art.SetRunRecord(runRecord)
	art.SetHistoryMsg(history)

	defer func() {
		srRecord := buildSendRunRecord(ctx, runRecord, entity.RunStatusCompleted)
		if err != nil {
			srRecord.Error = &entity.RunError{
				Code: errno.ErrConversationAgentRunError,
				Msg:  err.Error(),
			}
			art.RunProcess.StepToFailed(ctx, srRecord, art.SW)
			return
		}
		art.RunProcess.StepToComplete(ctx, srRecord, art.SW, art.GetUsage())
	}()

	input, err := mh.HandlerInput(ctx, art)
	if err != nil {
		return
	}
	art.SetInput(input)

	art.SetQuestionMsgID(input.ID)

	if art.GetAgentInfo().BotMode == bot_common.BotMode_WorkflowMode {
		err = art.ChatflowRun(ctx, art.ImagexClient)
	} else {
		err = art.AgentStreamExecute(ctx, art.ImagexClient)
	}
	return
}

func (art *AgentRuntime) getHistory(ctx context.Context) ([]*msgEntity.Message, error) {

	conversationTurns := getAgentHistoryRounds(art.GetAgentInfo())

	runRecordList, err := art.RunRecordRepo.List(ctx, &entity.ListRunRecordMeta{
		ConversationID: art.GetRunMeta().ConversationID,
		SectionID:      art.GetRunMeta().SectionID,
		Limit:          conversationTurns,
	})
	if err != nil {
		return nil, err
	}

	if len(runRecordList) == 0 {
		return nil, nil
	}
	runIDS := concactRunID(runRecordList)
	history, err := crossmessage.DefaultSVC().GetByRunIDs(ctx, art.GetRunMeta().ConversationID, runIDS)
	if err != nil {
		return nil, err
	}

	return history, nil
}

func concactRunID(rr []*entity.RunRecordMeta) []int64 {
	ids := make([]int64, 0, len(rr))
	for _, c := range rr {
		ids = append(ids, c.ID)
	}

	return ids
}

func (art *AgentRuntime) createRunRecord(ctx context.Context) (*entity.RunRecordMeta, error) {
	runPoData, err := art.RunRecordRepo.Create(ctx, art.GetRunMeta())
	if err != nil {
		logs.CtxErrorf(ctx, "RunRecordRepo.Create error: %v", err)
		return nil, err
	}

	srRecord := buildSendRunRecord(ctx, runPoData, entity.RunStatusCreated)

	art.RunProcess.StepToCreate(ctx, srRecord, art.SW)

	err = art.RunProcess.StepToInProgress(ctx, srRecord, art.SW)
	if err != nil {
		logs.CtxErrorf(ctx, "runProcess.StepToInProgress error: %v", err)
		return nil, err
	}
	return runPoData, nil
}
