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

package model

import "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"

type ExecuteToolOption struct {
	ProjectInfo *ProjectInfo

	AutoGenRespSchema bool

	ToolVersion                string
	Operation                  *Openapi3Operation
	InvalidRespProcessStrategy consts.InvalidResponseProcessStrategy

	ConversationID int64
}

type ExecuteToolOpt func(o *ExecuteToolOption)

type ProjectInfo struct {
	ProjectID      int64              // agentID or appID
	ProjectVersion *string            // if version is nil, use latest version
	ProjectType    consts.ProjectType // agent or app

	ConnectorID int64
}

func WithProjectInfo(info *ProjectInfo) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.ProjectInfo = info
	}
}

func WithToolVersion(version string) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.ToolVersion = version
	}
}

func WithOpenapiOperation(op *Openapi3Operation) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.Operation = op
	}
}

func WithInvalidRespProcessStrategy(strategy consts.InvalidResponseProcessStrategy) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.InvalidRespProcessStrategy = strategy
	}
}

func WithAutoGenRespSchema() ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.AutoGenRespSchema = true
	}
}

func WithPluginHTTPHeader(conversationID int64) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.ConversationID = conversationID
	}
}
