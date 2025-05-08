package internal

import (
	"context"
	"encoding/json"
	"time"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type RunProcess struct {
	event *Event
	*dal.RunRecordDAO
}

func NewRunProcess(db *gorm.DB, idGen idgen.IDGenerator) *RunProcess {
	return &RunProcess{
		RunRecordDAO: dal.NewRunRecordDAO(db, idGen),
	}
}

func (r *RunProcess) StepToCreate(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	_ = r.event.SendRunEvent(entity.RunEventCreated, srRecord, sw)
	return nil
}
func (r *RunProcess) StepToInProgress(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	srRecord.Status = entity.RunStatusInProgress
	updateMap := map[string]interface{}{
		"status":     string(entity.RunStatusInProgress),
		"updated_at": time.Now().UnixMilli(),
	}
	err := r.RunRecordDAO.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}

	_ = r.event.SendRunEvent(entity.RunEventInProgress, srRecord, sw)
	return nil
}

func (r *RunProcess) StepToComplete(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {

	// update run record
	completedAt := time.Now().UnixMilli()
	updateMap := map[string]interface{}{
		"status":       string(entity.RunStatusCompleted),
		"completed_at": completedAt,
	}
	err := r.RunRecordDAO.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}
	srRecord.CompletedAt = completedAt
	srRecord.Status = entity.RunStatusCompleted
	_ = r.event.SendRunEvent(entity.RunEventCompleted, srRecord, sw)

	return nil

}
func (r *RunProcess) StepToFailed(ctx context.Context, srRecord *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	// update run record
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

	err := r.RunRecordDAO.UpdateByID(ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}
	srRecord.Status = entity.RunStatusFailed
	srRecord.FailedAt = time.Now().UnixMilli()
	_ = r.event.SendRunEvent(entity.RunEventFailed, srRecord, sw)

	return nil
}

func (r *RunProcess) StepToDone(sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	_ = r.event.SendStreamDoneEvent(sw)

	return nil
}
