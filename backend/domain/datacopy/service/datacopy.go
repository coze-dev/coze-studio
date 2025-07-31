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

package service

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/datacopy"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/entity"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/internal/dal/dao"
	"github.com/coze-dev/coze-studio/backend/infra/impl/idgen"
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
	// Check if a task already exists
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
