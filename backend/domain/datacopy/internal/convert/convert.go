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

package convert

import (
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/entity"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/internal/dal/model"
)

func ConvertToDataCopyTaskModel(task *entity.CopyDataTask) *model.DataCopyTask {
	return &model.DataCopyTask{
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
		// ID: auto_increment
	}
}
