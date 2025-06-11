package internal

import (
	"context"
	"time"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/repository"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type RunProcess struct {
	event *Event

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

func (r *RunProcess) StepToComplete(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {

	completedAt := time.Now().UnixMilli()

	updateMeta := &entity.UpdateMeta{
		Status:      entity.RunStatusCompleted,
		CompletedAt: completedAt,
		UpdatedAt:   completedAt,
	}
	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMeta)
	if err != nil {
		logs.CtxErrorf(ctx, "RunRecordRepo.UpdateByID error: %v", err)
		r.event.SendErrEvent(entity.RunEventError, 10000, err.Error(), sw)
		return
	}

	srRecord.CompletedAt = completedAt
	srRecord.Status = entity.RunStatusCompleted

	r.event.SendRunEvent(entity.RunEventCompleted, srRecord, sw)

	r.event.SendStreamDoneEvent(sw)
	return

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
		r.event.SendErrEvent(entity.RunEventError, 10000, err.Error(), sw)
		logs.CtxErrorf(ctx, "update run record failed, err: %v", err)
		return
	}
	srRecord.Status = entity.RunStatusFailed
	srRecord.FailedAt = time.Now().UnixMilli()
	r.event.SendErrEvent(entity.RunEventError, srRecord.Error.Code, srRecord.Error.Msg, sw)
	return
}

func (r *RunProcess) StepToDone(sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	r.event.SendStreamDoneEvent(sw)
}
