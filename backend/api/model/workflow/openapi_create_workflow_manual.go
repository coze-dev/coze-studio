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

type OpenAPICreateWorkflowRequest struct {
	Name               string        `json:"name" form:"name"`
	Description        *string       `json:"description,omitempty" form:"description"`
	IconURI            *string       `json:"icon_uri,omitempty" form:"icon_uri"`
	SpaceID            string        `json:"space_id" form:"space_id"`
	FlowMode           *WorkflowMode `json:"flow_mode,omitempty" form:"flow_mode"`
	Schema             *string       `json:"schema,omitempty" form:"schema"`
	Validate           *bool         `json:"validate,omitempty" form:"validate"`
	ProjectID          *string       `json:"project_id,omitempty" form:"project_id"`
	CreateConversation *bool         `json:"create_conversation,omitempty" form:"create_conversation"`
	Base               *base.Base    `json:"base,omitempty" form:"base"`
}

func (p *OpenAPICreateWorkflowRequest) GetName() string {
	return p.Name
}

func (p *OpenAPICreateWorkflowRequest) GetDescription() string {
	if p.Description == nil {
		return ""
	}
	return *p.Description
}

func (p *OpenAPICreateWorkflowRequest) IsSetDescription() bool {
	return p.Description != nil
}

func (p *OpenAPICreateWorkflowRequest) GetIconURI() string {
	if p.IconURI == nil {
		return ""
	}
	return *p.IconURI
}

func (p *OpenAPICreateWorkflowRequest) IsSetIconURI() bool {
	return p.IconURI != nil
}

func (p *OpenAPICreateWorkflowRequest) GetSpaceID() string {
	return p.SpaceID
}

func (p *OpenAPICreateWorkflowRequest) GetFlowMode() WorkflowMode {
	if p.FlowMode == nil {
		return WorkflowMode_Workflow
	}
	return *p.FlowMode
}

func (p *OpenAPICreateWorkflowRequest) IsSetFlowMode() bool {
	return p.FlowMode != nil
}

func (p *OpenAPICreateWorkflowRequest) GetSchema() string {
	if p.Schema == nil {
		return ""
	}
	return *p.Schema
}

func (p *OpenAPICreateWorkflowRequest) IsSetSchema() bool {
	return p.Schema != nil
}

func (p *OpenAPICreateWorkflowRequest) GetValidate() bool {
	if p.Validate == nil {
		return false
	}
	return *p.Validate
}

func (p *OpenAPICreateWorkflowRequest) IsSetValidate() bool {
	return p.Validate != nil
}

func (p *OpenAPICreateWorkflowRequest) GetProjectID() string {
	if p.ProjectID == nil {
		return ""
	}
	return *p.ProjectID
}

func (p *OpenAPICreateWorkflowRequest) IsSetProjectID() bool {
	return p.ProjectID != nil
}

func (p *OpenAPICreateWorkflowRequest) GetCreateConversation() bool {
	if p.CreateConversation == nil {
		return false
	}
	return *p.CreateConversation
}

func (p *OpenAPICreateWorkflowRequest) IsSetCreateConversation() bool {
	return p.CreateConversation != nil
}

type OpenAPICreateWorkflowData struct {
	WorkflowID        string              `json:"workflow_id,omitempty"`
	IsValid           *bool               `json:"is_valid,omitempty"`
	ValidationResults []*ValidateTreeInfo `json:"validation_results,omitempty"`
}

type OpenAPICreateWorkflowResponse struct {
	Data     *OpenAPICreateWorkflowData `json:"data,omitempty"`
	Code     *int64                     `json:"code,omitempty"`
	Msg      *string                    `json:"msg,omitempty"`
	BaseResp *base.BaseResp             `json:"base_resp,omitempty"`
}
