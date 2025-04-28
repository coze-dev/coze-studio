package internal

import (
	"context"
	"encoding/json"
	"time"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type RunProcess struct {
	ctx   context.Context
	event *Event
	*dal.ChatDAO
}

func NewRunProcess(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], db *gorm.DB) *RunProcess {
	return &RunProcess{
		ctx: ctx,
		event: &Event{
			ctx: ctx,
			sw:  sw,
		},
		ChatDAO: dal.NewChatDAO(db),
	}
}

func (r *RunProcess) StepToCreate(srRecord *entity.ChunkRunItem) error {
	_ = r.event.SendRunEvent(entity.RunEventCreated, srRecord)
	return nil
}
func (r *RunProcess) StepToInProgress(srRecord *entity.ChunkRunItem) error {
	srRecord.Status = entity.RunStatusInProgress
	updateMap := map[string]interface{}{
		"status":     string(entity.RunStatusInProgress),
		"updated_at": time.Now().UnixMilli(),
	}
	err := r.ChatDAO.UpdateByID(r.ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}

	_ = r.event.SendRunEvent(entity.RunEventInProgress, srRecord)
	return nil
}

func (r *RunProcess) StepToComplete(srRecord *entity.ChunkRunItem) error {

	//update run record
	updateMap := map[string]interface{}{
		"status":       string(entity.RunStatusCompleted),
		"completed_at": time.Now().UnixMilli(),
	}
	err := r.ChatDAO.UpdateByID(r.ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}
	_ = r.event.SendRunEvent(entity.RunEventCompleted, srRecord)

	return nil

}
func (r *RunProcess) StepToFailed(srRecord *entity.ChunkRunItem) error {
	//update run record
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

	err := r.ChatDAO.UpdateByID(r.ctx, srRecord.ID, updateMap)

	if err != nil {
		return err
	}

	_ = r.event.SendRunEvent(entity.RunEventFailed, srRecord)

	return nil
}

func (r *RunProcess) StepToDone() error {
	_ = r.event.SendStreamDoneEvent()

	return nil
}
