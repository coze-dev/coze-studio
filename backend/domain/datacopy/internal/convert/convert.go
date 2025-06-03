package convert

import (
	"code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/model"
)

func ConvertToDataCopyTaskModel(task *entity.CopyDataTask) *model.DataCopyTask {
	return &model.DataCopyTask{
		ID:            task.ID,
		MasterTaskID:  task.TaskUniqKey,
		OriginDataID:  task.OriginDataID,
		TargetDataID:  task.TargetDataID,
		OriginSpaceID: task.OriginSpaceID,
		TargetSpaceID: task.TargetSpaceID,
		OriginUserID:  task.OriginUserID,
		TargetUserID:  task.TargetUserID,
		OriginAppID:   task.OriginAppID,
		TargetAppID:   task.TargetAppID,
		DataType:      int32(task.DataType),
		Status:        int32(task.Status),
		StartTime:     task.StartTime,
		FinishTime:    task.FinishTime,
		ExtInfo:       task.ExtInfo,
		ErrorMsg:      task.ErrorMsg,
	}
}
