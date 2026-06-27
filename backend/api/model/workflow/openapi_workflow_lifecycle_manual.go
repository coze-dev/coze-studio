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

package workflow

import "github.com/coze-dev/coze-studio/backend/api/model/base"

type OpenAPIGetWorkflowDetailRequest struct {
	WorkflowID string     `json:"-" form:"-" query:"-"`
	SpaceID    string     `json:"space_id,omitempty" form:"space_id" query:"space_id"`
	Base       *base.Base `json:"base,omitempty" form:"base" query:"base"`
}

func (p *OpenAPIGetWorkflowDetailRequest) GetWorkflowID() string {
	return p.WorkflowID
}

func (p *OpenAPIGetWorkflowDetailRequest) GetSpaceID() string {
	return p.SpaceID
}

type OpenAPIGetWorkflowDetailData struct {
	WorkflowID             string                     `json:"workflow_id"`
	SpaceID                string                     `json:"space_id"`
	Name                   string                     `json:"name"`
	Description            string                     `json:"description"`
	IconURI                string                     `json:"icon_uri"`
	IconURL                string                     `json:"icon_url"`
	FlowMode               WorkflowMode               `json:"flow_mode"`
	ProjectID              *string                    `json:"project_id,omitempty"`
	CreatedAt              int64                      `json:"created_at"`
	UpdatedAt              int64                      `json:"updated_at"`
	Status                 WorkFlowDevStatus          `json:"status"`
	Schema                 string                     `json:"schema"`
	CommitID               string                     `json:"commit_id"`
	DraftCommitID          string                     `json:"draft_commit_id"`
	VCSType                VCSCanvasType              `json:"vcs_type"`
	LatestPublishedVersion string                     `json:"latest_published_version"`
	Inputs                 []*OpenAPIWorkflowVariable `json:"inputs,omitempty"`
	Outputs                []*OpenAPIWorkflowVariable `json:"outputs,omitempty"`
	EndType                int32                      `json:"end_type"`
}

type OpenAPIWorkflowVariable struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Required     bool   `json:"required,omitempty"`
	AssistType   int64  `json:"assistType,omitempty"`
	Schema       any    `json:"schema,omitempty"`
	Description  string `json:"description,omitempty"`
	ReadOnly     bool   `json:"readOnly,omitempty"`
	DefaultValue any    `json:"defaultValue,omitempty"`
}

type OpenAPIGetWorkflowDetailResponse struct {
	Data     *OpenAPIGetWorkflowDetailData `json:"data,omitempty"`
	Code     *int64                        `json:"code,omitempty"`
	Msg      *string                       `json:"msg,omitempty"`
	BaseResp *base.BaseResp                `json:"base_resp,omitempty"`
}

type OpenAPIUpdateWorkflowRequest struct {
	WorkflowID  string        `json:"-" form:"-" query:"-"`
	SpaceID     string        `json:"space_id" form:"space_id"`
	Name        *string       `json:"name,omitempty" form:"name"`
	Description *string       `json:"description,omitempty" form:"description"`
	IconURI     *string       `json:"icon_uri,omitempty" form:"icon_uri"`
	FlowMode    *WorkflowMode `json:"flow_mode,omitempty" form:"flow_mode"`
	Schema      *string       `json:"schema,omitempty" form:"schema"`
	Validate    *bool         `json:"validate,omitempty" form:"validate"`
	Base        *base.Base    `json:"base,omitempty" form:"base"`
}

func (p *OpenAPIUpdateWorkflowRequest) GetWorkflowID() string {
	return p.WorkflowID
}

func (p *OpenAPIUpdateWorkflowRequest) GetSpaceID() string {
	return p.SpaceID
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetName() bool {
	return p.Name != nil
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetDescription() bool {
	return p.Description != nil
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetIconURI() bool {
	return p.IconURI != nil
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetFlowMode() bool {
	return p.FlowMode != nil
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetSchema() bool {
	return p.Schema != nil
}

func (p *OpenAPIUpdateWorkflowRequest) IsSetValidate() bool {
	return p.Validate != nil
}

func (p *OpenAPIUpdateWorkflowRequest) GetSchema() string {
	if p.Schema == nil {
		return ""
	}
	return *p.Schema
}

func (p *OpenAPIUpdateWorkflowRequest) GetValidate() bool {
	if p.Validate == nil {
		return false
	}
	return *p.Validate
}

type OpenAPIUpdateWorkflowData struct {
	WorkflowID        string              `json:"workflow_id,omitempty"`
	CommitID          string              `json:"commit_id,omitempty"`
	IsValid           *bool               `json:"is_valid,omitempty"`
	ValidationResults []*ValidateTreeInfo `json:"validation_results,omitempty"`
}

type OpenAPIUpdateWorkflowResponse struct {
	Data     *OpenAPIUpdateWorkflowData `json:"data,omitempty"`
	Code     *int64                     `json:"code,omitempty"`
	Msg      *string                    `json:"msg,omitempty"`
	BaseResp *base.BaseResp             `json:"base_resp,omitempty"`
}

type OpenAPIPublishWorkflowRequest struct {
	WorkflowID         string     `json:"-" form:"-" query:"-"`
	SpaceID            string     `json:"space_id" form:"space_id"`
	CommitID           *string    `json:"commit_id,omitempty" form:"commit_id"`
	Force              *bool      `json:"force,omitempty" form:"force"`
	WorkflowVersion    *string    `json:"workflow_version,omitempty" form:"workflow_version"`
	VersionDescription *string    `json:"version_description,omitempty" form:"version_description"`
	Base               *base.Base `json:"base,omitempty" form:"base"`
}

func (p *OpenAPIPublishWorkflowRequest) GetWorkflowID() string {
	return p.WorkflowID
}

func (p *OpenAPIPublishWorkflowRequest) GetSpaceID() string {
	return p.SpaceID
}

func (p *OpenAPIPublishWorkflowRequest) GetCommitID() string {
	if p.CommitID == nil {
		return ""
	}
	return *p.CommitID
}

func (p *OpenAPIPublishWorkflowRequest) GetForce() bool {
	if p.Force == nil {
		return false
	}
	return *p.Force
}

func (p *OpenAPIPublishWorkflowRequest) GetWorkflowVersion() string {
	if p.WorkflowVersion == nil {
		return ""
	}
	return *p.WorkflowVersion
}

func (p *OpenAPIPublishWorkflowRequest) GetVersionDescription() string {
	if p.VersionDescription == nil {
		return ""
	}
	return *p.VersionDescription
}

type OpenAPIPublishWorkflowData struct {
	WorkflowID      string `json:"workflow_id,omitempty"`
	WorkflowVersion string `json:"workflow_version,omitempty"`
	Success         bool   `json:"success"`
}

type OpenAPIPublishWorkflowResponse struct {
	Data     *OpenAPIPublishWorkflowData `json:"data,omitempty"`
	Code     *int64                      `json:"code,omitempty"`
	Msg      *string                     `json:"msg,omitempty"`
	BaseResp *base.BaseResp              `json:"base_resp,omitempty"`
}

type OpenAPIDeleteWorkflowRequest struct {
	WorkflowID string        `json:"-" form:"-" query:"-"`
	SpaceID    string        `json:"space_id,omitempty" form:"space_id" query:"space_id"`
	Action     *DeleteAction `json:"action,omitempty" form:"action" query:"action"`
	Base       *base.Base    `json:"base,omitempty" form:"base" query:"base"`
}

func (p *OpenAPIDeleteWorkflowRequest) GetWorkflowID() string {
	return p.WorkflowID
}

func (p *OpenAPIDeleteWorkflowRequest) GetSpaceID() string {
	return p.SpaceID
}

func (p *OpenAPIDeleteWorkflowRequest) GetAction() DeleteAction {
	if p.Action == nil {
		return DeleteAction(0)
	}
	return *p.Action
}

type OpenAPIDeleteWorkflowData struct {
	WorkflowID string       `json:"workflow_id,omitempty"`
	Status     DeleteStatus `json:"status"`
}

type OpenAPIDeleteWorkflowResponse struct {
	Data     *OpenAPIDeleteWorkflowData `json:"data,omitempty"`
	Code     *int64                     `json:"code,omitempty"`
	Msg      *string                    `json:"msg,omitempty"`
	BaseResp *base.BaseResp             `json:"base_resp,omitempty"`
}
