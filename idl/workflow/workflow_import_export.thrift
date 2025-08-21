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

namespace go workflow

include "../base.thrift"

// Export Workflow Structures

struct ExportWorkflowData {
    1: required string export_package   (go.tag="json:\"export_package,required\"")
    2: required string file_name        (go.tag="json:\"file_name,required\"")
    3: required string content_type     (go.tag="json:\"content_type,required\"")
    4: required i64    size             (go.tag="json:\"size,required\"")
}

struct ExportWorkflowRequest {
    1: required list<string> WorkflowIDs          (go.tag="json:\"workflow_ids,required\" form:\"workflow_ids,required\" query:\"workflow_ids,required\"")
    2: required string       SpaceID              (go.tag="json:\"space_id,required\" form:\"space_id,required\" query:\"space_id,required\"")
    3: optional bool         IncludeDependencies  (go.tag="json:\"include_dependencies,omitempty\" form:\"include_dependencies\" query:\"include_dependencies\"")
    4: optional bool         IncludeVersions      (go.tag="json:\"include_versions,omitempty\" form:\"include_versions\" query:\"include_versions\"")
    5: optional string       ExportFormat         (go.tag="json:\"export_format,omitempty\" form:\"export_format\" query:\"export_format\"")
    6: optional string       Description          (go.tag="json:\"description,omitempty\" form:\"description\" query:\"description\"")
    255: optional base.Base  Base                 (go.tag="json:\"Base,omitempty\" form:\"Base\" query:\"Base\"")
}

struct ExportWorkflowResponse {
    1: required ExportWorkflowData data     (go.tag="json:\"data,required\"")
    253: required i64              code     (go.tag="json:\"code,required\"")
    254: required string           msg      (go.tag="json:\"msg,required\"")
    255: required base.BaseResp    BaseResp (go.tag="json:\"BaseResp,required\"")
}

// Import Workflow Structures

struct ImportWorkflowData {
    1: required string import_result  (go.tag="json:\"import_result,required\"")
    2: required string summary        (go.tag="json:\"summary,required\"")
}

struct ImportWorkflowRequest {
    1: required string       SpaceID                     (go.tag="json:\"space_id,required\" form:\"space_id,required\" query:\"space_id,required\"")
    2: required string       ImportPackage               (go.tag="json:\"import_package,required\" form:\"import_package,required\"")
    3: optional string       TargetAppID                 (go.tag="json:\"target_app_id,omitempty\" form:\"target_app_id\" query:\"target_app_id\"")
    4: optional string       ConflictResolution          (go.tag="json:\"conflict_resolution,omitempty\" form:\"conflict_resolution\" query:\"conflict_resolution\"")
    5: optional bool         ShouldModifyWorkflowName    (go.tag="json:\"should_modify_workflow_name,omitempty\" form:\"should_modify_workflow_name\" query:\"should_modify_workflow_name\"")
    6: optional bool         PreserveOriginalIDs         (go.tag="json:\"preserve_original_ids,omitempty\" form:\"preserve_original_ids\" query:\"preserve_original_ids\"")
    7: optional bool         ValidateOnly                (go.tag="json:\"validate_only,omitempty\" form:\"validate_only\" query:\"validate_only\"")
    255: optional base.Base  Base                        (go.tag="json:\"Base,omitempty\" form:\"Base\" query:\"Base\"")
}

struct ImportWorkflowResponse {
    1: required ImportWorkflowData data     (go.tag="json:\"data,required\"")
    253: required i64              code     (go.tag="json:\"code,required\"")
    254: required string           msg      (go.tag="json:\"msg,required\"")
    255: required base.BaseResp    BaseResp (go.tag="json:\"BaseResp,required\"")
}

// Validate Import Structures

struct ValidateImportData {
    1: required string validation_result  (go.tag="json:\"validation_result,required\"")
    2: required bool   is_valid          (go.tag="json:\"is_valid,required\"")
    3: required string summary           (go.tag="json:\"summary,required\"")
}

struct ValidateImportRequest {
    1: required string      import_package     (go.tag="json:\"import_package,required\" form:\"import_package,required\"")
    2: required string      target_space_id    (go.tag="json:\"target_space_id,required\" form:\"target_space_id,required\" query:\"target_space_id,required\"")
    255: optional base.Base Base               (go.tag="json:\"Base,omitempty\" form:\"Base\" query:\"Base\"")
}

struct ValidateImportResponse {
    1: required ValidateImportData data     (go.tag="json:\"data,required\"")
    253: required i64              code     (go.tag="json:\"code,required\"")
    254: required string           msg      (go.tag="json:\"msg,required\"")
    255: required base.BaseResp    BaseResp (go.tag="json:\"BaseResp,required\"")
}

// Service Definition
service WorkflowImportExportService {
    ExportWorkflowResponse ExportWorkflow(1: ExportWorkflowRequest req) (api.post="/api/workflow_api/export")
    ImportWorkflowResponse ImportWorkflow(1: ImportWorkflowRequest req) (api.post="/api/workflow_api/import")  
    ValidateImportResponse ValidateImport(1: ValidateImportRequest req) (api.post="/api/workflow_api/validate_import")
}