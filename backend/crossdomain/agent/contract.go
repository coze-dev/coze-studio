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

package agent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"

	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"

	"github.com/coze-dev/coze-studio/backend/api/model/playground"
)

// Requests and responses must not reference domain entities and can only use models under api/model/crossdomain.
type SingleAgent interface {
	StreamExecute(ctx context.Context,
		agentRuntime *AgentRuntime) (*schema.StreamReader[*model.AgentEvent], error)
	ObtainAgentByIdentity(ctx context.Context, identity *model.AgentIdentity) (*model.SingleAgent, error)
}

type AgentRuntime struct {
	AgentVersion     string
	UserID           string
	AgentID          int64
	ConversationId   int64
	IsDraft          bool
	SpaceID          int64
	ConnectorID      int64
	PreRetrieveTools []*agentrun.Tool
	CustomVariables  map[string]string

	HistoryMsg []*schema.Message
	Input      *schema.Message
	ResumeInfo *ResumeInfo
}

type ResumeInfo = model.InterruptInfo

type AgentEvent = model.AgentEvent

var defaultSVC SingleAgent

func DefaultSVC() SingleAgent {
	return defaultSVC
}

func SetDefaultSVC(svc SingleAgent) {
	defaultSVC = svc
}

type ShortcutCommandComponentType string

const (
	ShortcutCommandComponentTypeText   ShortcutCommandComponentType = "text"
	ShortcutCommandComponentTypeSelect ShortcutCommandComponentType = "select"
	ShortcutCommandComponentTypeFile   ShortcutCommandComponentType = "file"
)

var ShortcutCommandComponentTypeMapping = map[playground.InputType]ShortcutCommandComponentType{
	playground.InputType_TextInput:   ShortcutCommandComponentTypeText,
	playground.InputType_Select:      ShortcutCommandComponentTypeSelect,
	playground.InputType_MixUpload:   ShortcutCommandComponentTypeFile,
	playground.InputType_UploadImage: ShortcutCommandComponentTypeFile,
	playground.InputType_UploadDoc:   ShortcutCommandComponentTypeFile,
	playground.InputType_UploadTable: ShortcutCommandComponentTypeFile,
	playground.InputType_UploadAudio: ShortcutCommandComponentTypeFile,
	playground.InputType_VIDEO:       ShortcutCommandComponentTypeFile,
	playground.InputType_ARCHIVE:     ShortcutCommandComponentTypeFile,
	playground.InputType_CODE:        ShortcutCommandComponentTypeFile,
	playground.InputType_TXT:         ShortcutCommandComponentTypeFile,
	playground.InputType_PPT:         ShortcutCommandComponentTypeFile,
}

type ShortcutCommandComponentFileType string

const (
	ShortcutCommandComponentFileTypeImage ShortcutCommandComponentFileType = "image"
	ShortcutCommandComponentFileTypeDoc   ShortcutCommandComponentFileType = "doc"
	ShortcutCommandComponentFileTypeTable ShortcutCommandComponentFileType = "table"
	ShortcutCommandComponentFileTypeAudio ShortcutCommandComponentFileType = "audio"
	ShortcutCommandComponentFileTypeVideo ShortcutCommandComponentFileType = "video"
	ShortcutCommandComponentFileTypeZip   ShortcutCommandComponentFileType = "zip"
	ShortcutCommandComponentFileTypeCode  ShortcutCommandComponentFileType = "code"
	ShortcutCommandComponentFileTypeTxt   ShortcutCommandComponentFileType = "txt"
	ShortcutCommandComponentFileTypePPT   ShortcutCommandComponentFileType = "ppt"
)

var ShortcutCommandComponentFileTypeMapping = map[playground.InputType]ShortcutCommandComponentFileType{
	playground.InputType_UploadImage: ShortcutCommandComponentFileTypeImage,
	playground.InputType_UploadDoc:   ShortcutCommandComponentFileTypeDoc,
	playground.InputType_UploadTable: ShortcutCommandComponentFileTypeTable,
	playground.InputType_UploadAudio: ShortcutCommandComponentFileTypeAudio,
	playground.InputType_VIDEO:       ShortcutCommandComponentFileTypeVideo,
	playground.InputType_ARCHIVE:     ShortcutCommandComponentFileTypeZip,
	playground.InputType_CODE:        ShortcutCommandComponentFileTypeCode,
	playground.InputType_TXT:         ShortcutCommandComponentFileTypeTxt,
	playground.InputType_PPT:         ShortcutCommandComponentFileTypePPT,
}

type ShortcutCommandToolType string

const (
	ShortcutCommandToolTypeWorkflow ShortcutCommandToolType = "workflow"
	ShortcutCommandToolTypePlugin   ShortcutCommandToolType = "plugin"
)
