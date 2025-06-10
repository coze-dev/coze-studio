package service

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/datacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
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
	task, err := svc.dataCopyTaskRepo.GetCopyTask(ctx, req.Task.TaskUniqKey, req.Task.OriginDataID, int32(req.Task.DataType))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if task != nil {
		taskStatus := entity.DataCopyTaskStatus(task.Status)
		resp.CopyTaskStatus = taskStatus
		resp.TargetID = task.TargetDataID
		return &resp, nil
	}

	task = convert.ConvertToDataCopyTaskModel(req.Task)
	task.Status = int32(entity.DataCopyTaskStatusCreate)
	err = svc.dataCopyTaskRepo.UpsertCopyTask(ctx, task)
	if err != nil {
		return nil, err
	}
	resp.CopyTaskStatus = entity.DataCopyTaskStatusCreate
	resp.TargetID = task.TargetDataID
	return &resp, nil

}

func (svc *dataCopySVC) UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error {
	task := convert.ConvertToDataCopyTaskModel(req.Task)
	return svc.dataCopyTaskRepo.UpsertCopyTask(ctx, task)
}

func (svc *dataCopySVC) UpdateCopyTaskWithTX(ctx context.Context, req *datacopy.UpdateCopyTaskReq, tx *gorm.DB) error {
	task := convert.ConvertToDataCopyTaskModel(req.Task)
	return svc.dataCopyTaskRepo.UpsertCopyTaskWithTX(ctx, task, tx)
}
