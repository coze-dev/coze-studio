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

package entity

type CopyDataTask struct {
	TaskUniqKey   string // 复制任务的唯一标志
	OriginDataID  int64
	TargetDataID  int64
	OriginSpaceID int64
	TargetSpaceID int64
	OriginUserID  int64
	TargetUserID  int64
	OriginAppID   int64
	TargetAppID   int64
	Status        DataCopyTaskStatus
	DataType      DataType
	StartTime     int64 // 任务开始时间ms
	FinishTime    int64 // 任务结束时间ms
	ExtInfo       string
	ErrorMsg      string // 复制失败的错误信息
}
type DataCopyTaskStatus int

const (
	DataCopyTaskStatusCreate     DataCopyTaskStatus = 1
	DataCopyTaskStatusInProgress DataCopyTaskStatus = 2
	DataCopyTaskStatusSuccess    DataCopyTaskStatus = 3
	DataCopyTaskStatusFail       DataCopyTaskStatus = 4
)

type DataType int

const (
	DataTypeKnowledge DataType = 1
	DataTypeDatabase  DataType = 2
	DataTypeVariable  DataType = 3
)
