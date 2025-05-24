package internal

import (
	"context"
	"encoding/json"
	"time"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/repository"
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
	updateMap := map[string]interface{}{
		"status":     string(entity.RunStatusInProgress),
		"updated_at": time.Now().UnixMilli(),
	}
	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}

	r.event.SendRunEvent(entity.RunEventInProgress, srRecord, sw)
	return nil
}

func (r *RunProcess) StepToComplete(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {

	completedAt := time.Now().UnixMilli()
	updateMap := map[string]interface{}{
		"status":       string(entity.RunStatusCompleted),
		"completed_at": completedAt,
	}
	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}
	srRecord.CompletedAt = completedAt
	srRecord.Status = entity.RunStatusCompleted

	r.event.SendRunEvent(entity.RunEventCompleted, srRecord, sw)

	return nil

}
func (r *RunProcess) StepToFailed(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {

	updateMap := map[string]interface{}{
		"status":    string(entity.RunStatusFailed),
		"failed_at": time.Now().UnixMilli(),
	}

	if srRecord.Error != nil {
		errString, err := json.Marshal(srRecord.Error)
		if err == nil {
			updateMap["last_error"] = errString
		}
	}

	err := r.RunRecordRepo.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}
	srRecord.Status = entity.RunStatusFailed
	srRecord.FailedAt = time.Now().UnixMilli()
	r.event.SendErrEvent(entity.RunEventError, srRecord.Error.Code, srRecord.Error.Msg, sw)
	return nil
}

func (r *RunProcess) StepToDone(sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	r.event.SendStreamDoneEvent(sw)
}
