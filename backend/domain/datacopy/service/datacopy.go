package service

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/datacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"gorm.io/gorm"
)

type DataCopySVCConfig struct {
	DB    *gorm.DB          // required
	IDGen idgen.IDGenerator // required
}

func NewDataCopySVC(config *DataCopySVCConfig) datacopy.DataCopy {
	svc := &dataCopySVC{
		dataCopyTaskRepo: dao.NewDataCopyTaskDAO(config.DB),
		idgen:            config.IDGen,
	}
	return svc
}

type dataCopySVC struct {
	dataCopyTaskRepo dao.DataCopyTaskRepo
	idgen            idgen.IDGenerator
}

func (svc *dataCopySVC) CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error) {
	if req == nil || req.Task == nil {
		return nil, errors.New("invalid request")
	}
	if req.Task.OriginDataID == 0 {
		return nil, errors.New("invalid origin data id")
	}
	if len(req.Task.TaskUniqKey) == 0 {
		return nil, errors.New("invalid task uniq key")
	}
	var err error
	resp := datacopy.CheckAndGenCopyTaskResp{}
	// 检查是否已经存在任务
	task, err := svc.dataCopyTaskRepo.GetCopyTaskByTaskID(ctx, req.Task.TaskUniqKey)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if task != nil {
		taskStatus := entity.DataCopyTaskStatus(task.Status)
		switch taskStatus {
		case entity.DataCopyTaskStatusSuccess:
			resp.CopyTaskStatus = taskStatus
			resp.TargetID = task.TargetDataID
			resp.CopyTaskID = task.ID
			return &resp, nil
		case entity.DataCopyTaskStatusCreate, entity.DataCopyTaskStatusInProgress:
			resp.CopyTaskStatus = taskStatus
			resp.CopyTaskID = task.ID
			resp.TargetID = task.TargetDataID
			return &resp, nil
		case entity.DataCopyTaskStatusFail:
			resp.CopyTaskStatus = entity.DataCopyTaskStatusInProgress // 重试，设置为处理中
			resp.CopyTaskID = task.ID
			resp.TargetID = task.TargetDataID
			return &resp, nil
		}
	} else {
		if req.Task.ID == 0 {
			req.Task.ID, err = svc.idgen.GenID(ctx)
			if err != nil {
				return nil, err
			}
		}
		task := model.DataCopyTask{
			ID:            req.Task.ID,
			MasterTaskID:  req.Task.TaskUniqKey,
			OriginDataID:  req.Task.OriginDataID,
			TargetDataID:  req.Task.TargetDataID,
			OriginSpaceID: req.Task.OriginSpaceID,
			TargetSpaceID: req.Task.TargetSpaceID,
			OriginUserID:  req.Task.OriginUserID,
			TargetUserID:  req.Task.TargetUserID,
			OriginAppID:   req.Task.OriginAppID,
			TargetAppID:   req.Task.TargetAppID,
			DataType:      int32(req.Task.DataType),
			ExtInfo:       req.Task.ExtInfo,
			StartTime:     req.Task.StartTime,
			Status:        int32(entity.DataCopyTaskStatusCreate),
		}
		err = svc.dataCopyTaskRepo.CreateCopyTask(ctx, &task)
		if err != nil {
			return nil, err
		}
		resp.CopyTaskStatus = entity.DataCopyTaskStatusCreate
		resp.CopyTaskID = task.ID
		resp.TargetID = task.TargetDataID
		return &resp, nil
	}
	return nil, nil
}

func (svc *dataCopySVC) UpdateTaskStatus(ctx context.Context, req *datacopy.UpdateTaskStatusReq) error {
	return svc.dataCopyTaskRepo.UpdateCopyTaskStatus(ctx, req.CopyTaskID, int32(req.Status), req.ErrMsg, req.ExtInfo)
}
