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

	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type RunProcess struct {
	event         *Event
	SW            *schema.StreamWriter[*entity.AgentRunResponse]
	RunRecordRepo repository.RunRecordRepo
}

func NewRunProcess(runRecordRepo repository.RunRecordRepo) *RunProcess {
	return &RunProcess{
		RunRecordRepo: runRecordRepo,
	}
}

func (r *RunProcess) StepToCreate(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	srRecord.Status = entity.RunStatusCreated
	r.event.SendRunEvent(entity.RunEventCreated, srRecord, sw)
}
func (r *RunProcess) StepToInProgress(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	srRecord.Status = entity.RunStatusInProgress

	updateMeta := &entity.UpdateMeta{
		Status:    entity.RunStatusInProgress,
		UpdatedAt: time.Now().UnixMilli(),
	}
	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMeta)

	if err != nil {
		return err
	}

	r.event.SendRunEvent(entity.RunEventInProgress, srRecord, sw)
	return nil
}

func (r *RunProcess) StepToComplete(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse], usage *agentrun.Usage) {

	completedAt := time.Now().UnixMilli()

	updateMeta := &entity.UpdateMeta{
		Status:      entity.RunStatusCompleted,
		Usage:       usage,
		CompletedAt: completedAt,
		UpdatedAt:   completedAt,
	}
	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMeta)
	if err != nil {
		logs.CtxErrorf(ctx, "RunRecordRepo.UpdateByID error: %v", err)
		r.event.SendErrEvent(entity.RunEventError, sw, &entity.RunError{
			Code: errno.ErrConversationAgentRunError,
			Msg:  err.Error(),
		})
		return
	}

	srRecord.CompletedAt = completedAt
	srRecord.Status = entity.RunStatusCompleted

	r.event.SendRunEvent(entity.RunEventCompleted, srRecord, sw)

	r.event.SendStreamDoneEvent(sw)
}
func (r *RunProcess) StepToFailed(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {

	nowTime := time.Now().UnixMilli()
	updateMeta := &entity.UpdateMeta{
		Status:    entity.RunStatusFailed,
		UpdatedAt: nowTime,
		FailedAt:  nowTime,
		LastError: srRecord.Error,
	}

	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMeta)

	if err != nil {
		r.event.SendErrEvent(entity.RunEventError, sw, &entity.RunError{
			Code: errno.ErrConversationAgentRunError,
			Msg:  err.Error(),
		})
		logs.CtxErrorf(ctx, "update run record failed, err: %v", err)
		return
	}
	srRecord.Status = entity.RunStatusFailed
	srRecord.FailedAt = time.Now().UnixMilli()
	r.event.SendErrEvent(entity.RunEventError, sw, &entity.RunError{
		Code: srRecord.Error.Code,
		Msg:  srRecord.Error.Msg,
	})
}

func (r *RunProcess) StepToDone(sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	r.event.SendStreamDoneEvent(sw)
}
