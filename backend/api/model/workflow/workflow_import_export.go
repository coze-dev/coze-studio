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

import (
	"github.com/coze-dev/coze-studio/backend/api/model/base"
)

// ExportWorkflowRequest represents the request for exporting workflows
type ExportWorkflowRequest struct {
	WorkflowIDs         []string `json:"workflow_ids,required" form:"workflow_ids,required" query:"workflow_ids,required"`
	SpaceID             string   `json:"space_id,required" form:"space_id,required" query:"space_id,required"`
	IncludeDependencies *bool    `json:"include_dependencies,omitempty" form:"include_dependencies" query:"include_dependencies"`
	IncludeVersions     *bool    `json:"include_versions,omitempty" form:"include_versions" query:"include_versions"`
	ExportFormat        *string  `json:"export_format,omitempty" form:"export_format" query:"export_format"` // Default: "json"
	Description         *string  `json:"description,omitempty" form:"description" query:"description"`
	Base                *base.Base `json:"Base,omitempty" form:"Base" query:"Base"`
}

// ExportWorkflowData represents the exported workflow data in the response
type ExportWorkflowData struct {
	ExportPackage string `json:"export_package,required"` // JSON-encoded WorkflowExportPackage
	FileName      string `json:"file_name,required"`      // Suggested filename for download
	ContentType   string `json:"content_type,required"`   // MIME type (e.g., "application/json")
	Size          int64  `json:"size,required"`           // Size in bytes
}

// ExportWorkflowResponse represents the response for exporting workflows
type ExportWorkflowResponse struct {
	Data     *ExportWorkflowData `json:"data,required"`
	Code     int64               `json:"code,required"`
	Msg      string              `json:"msg,required"`
	BaseResp *base.BaseResp      `json:"BaseResp,required"`
}

// ImportWorkflowRequest represents the request for importing workflows
type ImportWorkflowRequest struct {
	SpaceID                  string  `json:"space_id,required" form:"space_id,required" query:"space_id,required"`
	ImportPackage            string  `json:"import_package,required" form:"import_package,required"` // JSON-encoded WorkflowExportPackage
	TargetAppID              *string `json:"target_app_id,omitempty" form:"target_app_id" query:"target_app_id"`
	ConflictResolution       *string `json:"conflict_resolution,omitempty" form:"conflict_resolution" query:"conflict_resolution"` // "skip", "overwrite", "rename"
	ShouldModifyWorkflowName *bool   `json:"should_modify_workflow_name,omitempty" form:"should_modify_workflow_name" query:"should_modify_workflow_name"`
	PreserveOriginalIDs      *bool   `json:"preserve_original_ids,omitempty" form:"preserve_original_ids" query:"preserve_original_ids"`
	ValidateOnly             *bool   `json:"validate_only,omitempty" form:"validate_only" query:"validate_only"` // Only validate, don't import
	Base                     *base.Base `json:"Base,omitempty" form:"Base" query:"Base"`
}

// ImportWorkflowData represents the imported workflow data in the response
type ImportWorkflowData struct {
	ImportResult string `json:"import_result,required"` // JSON-encoded ImportResult
	Summary      string `json:"summary,required"`       // Human-readable summary
}

// ImportWorkflowResponse represents the response for importing workflows
type ImportWorkflowResponse struct {
	Data     *ImportWorkflowData `json:"data,required"`
	Code     int64               `json:"code,required"`
	Msg      string              `json:"msg,required"`
	BaseResp *base.BaseResp      `json:"BaseResp,required"`
}

// ValidateImportRequest represents the request for validating an import package
type ValidateImportRequest struct {
	ImportPackage string     `json:"import_package,required" form:"import_package,required"` // JSON-encoded WorkflowExportPackage
	TargetSpaceID string     `json:"target_space_id,required" form:"target_space_id,required" query:"target_space_id,required"`
	Base          *base.Base `json:"Base,omitempty" form:"Base" query:"Base"`
}

// ValidateImportData represents the validation result data
type ValidateImportData struct {
	ValidationResult string `json:"validation_result,required"` // JSON-encoded ValidationResult
	IsValid          bool   `json:"is_valid,required"`
	Summary          string `json:"summary,required"` // Human-readable summary
}

// ValidateImportResponse represents the response for validating an import package
type ValidateImportResponse struct {
	Data     *ValidateImportData `json:"data,required"`
	Code     int64               `json:"code,required"`
	Msg      string              `json:"msg,required"`
	BaseResp *base.BaseResp      `json:"BaseResp,required"`
}

// Constructor functions for requests
func NewExportWorkflowRequest() *ExportWorkflowRequest {
	return &ExportWorkflowRequest{}
}

func NewImportWorkflowRequest() *ImportWorkflowRequest {
	return &ImportWorkflowRequest{}
}

func NewValidateImportRequest() *ValidateImportRequest {
	return &ValidateImportRequest{}
}

// Constructor functions for responses
func NewExportWorkflowResponse() *ExportWorkflowResponse {
	return &ExportWorkflowResponse{}
}

func NewImportWorkflowResponse() *ImportWorkflowResponse {
	return &ImportWorkflowResponse{}
}

func NewValidateImportResponse() *ValidateImportResponse {
	return &ValidateImportResponse{}
}

// Constructor functions for data structures
func NewExportWorkflowData() *ExportWorkflowData {
	return &ExportWorkflowData{}
}

func NewImportWorkflowData() *ImportWorkflowData {
	return &ImportWorkflowData{}
}

func NewValidateImportData() *ValidateImportData {
	return &ValidateImportData{}
}