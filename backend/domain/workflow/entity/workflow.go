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

import (
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type ContentType = workflow.WorkFlowType
type Tag = workflow.Tag
type Mode = workflow.WorkflowMode

type Workflow struct {
	ID       int64
	CommitID string

	*vo.Meta
	*vo.CanvasInfo
	*vo.DraftMeta
	*vo.VersionMeta
}

func (w *Workflow) GetBasic() *WorkflowBasic {
	var version string
	if w.VersionMeta != nil {
		version = w.VersionMeta.Version
	}
	return &WorkflowBasic{
		ID:       w.ID,
		Version:  version,
		SpaceID:  w.SpaceID,
		AppID:    w.AppID,
		CommitID: w.CommitID,
	}
}

func (w *Workflow) GetLatestVersion() string {
	if w.LatestPublishedVersion == nil {
		return ""
	}

	return *w.LatestPublishedVersion
}

func (w *Workflow) GetVersion() string {
	if w.VersionMeta == nil {
		return ""
	}
	return w.VersionMeta.Version
}

type IDVersionPair struct {
	ID      int64
	Version string
}

type WorkflowBasic struct {
	ID       int64
	Version  string
	SpaceID  int64
	AppID    *int64
	CommitID string
}
