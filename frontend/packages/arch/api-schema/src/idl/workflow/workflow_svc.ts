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

import * as resource_common from './../resource/resource_common';
export { resource_common };
import * as trace from './trace';
export { trace };
import * as resource from './../resource/resource';
export { resource };
import * as workflow from './workflow';
export { workflow };
import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
/** Create process */
export const CreateWorkflow = /*#__PURE__*/createAPI<workflow.CreateWorkflowRequest, workflow.CreateWorkflowResponse>({
  "url": "/api/workflow_api/create",
  "method": "POST",
  "name": "CreateWorkflow",
  "reqType": "workflow.CreateWorkflowRequest",
  "reqMapping": {
    "body": ["name", "desc", "icon_uri", "space_id", "flow_mode", "schema_type", "bind_biz_id", "bind_biz_type", "project_id", "create_conversation"]
  },
  "resType": "workflow.CreateWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** query process */
export const GetCanvasInfo = /*#__PURE__*/createAPI<workflow.GetCanvasInfoRequest, workflow.GetCanvasInfoResponse>({
  "url": "/api/workflow_api/canvas",
  "method": "POST",
  "name": "GetCanvasInfo",
  "reqType": "workflow.GetCanvasInfoRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id"]
  },
  "resType": "workflow.GetCanvasInfoResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetHistorySchema = /*#__PURE__*/createAPI<workflow.GetHistorySchemaRequest, workflow.GetHistorySchemaResponse>({
  "url": "/api/workflow_api/history_schema",
  "method": "POST",
  "name": "GetHistorySchema",
  "reqType": "workflow.GetHistorySchemaRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id", "commit_id", "type", "env", "workflow_version", "project_version", "project_id", "execute_id", "sub_execute_id", "log_id"]
  },
  "resType": "workflow.GetHistorySchemaResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** save process */
export const SaveWorkflow = /*#__PURE__*/createAPI<workflow.SaveWorkflowRequest, workflow.SaveWorkflowResponse>({
  "url": "/api/workflow_api/save",
  "method": "POST",
  "name": "SaveWorkflow",
  "reqType": "workflow.SaveWorkflowRequest",
  "reqMapping": {
    "body": ["workflow_id", "schema", "space_id", "name", "desc", "icon_uri", "submit_commit_id", "ignore_status_transfer"]
  },
  "resType": "workflow.SaveWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const UpdateWorkflowMeta = /*#__PURE__*/createAPI<workflow.UpdateWorkflowMetaRequest, workflow.UpdateWorkflowMetaResponse>({
  "url": "/api/workflow_api/update_meta",
  "method": "POST",
  "name": "UpdateWorkflowMeta",
  "reqType": "workflow.UpdateWorkflowMetaRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id", "name", "desc", "icon_uri", "flow_mode"]
  },
  "resType": "workflow.UpdateWorkflowMetaResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const DeleteWorkflow = /*#__PURE__*/createAPI<workflow.DeleteWorkflowRequest, workflow.DeleteWorkflowResponse>({
  "url": "/api/workflow_api/delete",
  "method": "POST",
  "name": "DeleteWorkflow",
  "reqType": "workflow.DeleteWorkflowRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id", "action"]
  },
  "resType": "workflow.DeleteWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const BatchDeleteWorkflow = /*#__PURE__*/createAPI<workflow.BatchDeleteWorkflowRequest, workflow.BatchDeleteWorkflowResponse>({
  "url": "/api/workflow_api/batch_delete",
  "method": "POST",
  "name": "BatchDeleteWorkflow",
  "reqType": "workflow.BatchDeleteWorkflowRequest",
  "reqMapping": {
    "body": ["workflow_id_list", "space_id", "action"]
  },
  "resType": "workflow.BatchDeleteWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetDeleteStrategy = /*#__PURE__*/createAPI<workflow.GetDeleteStrategyRequest, workflow.GetDeleteStrategyResponse>({
  "url": "/api/workflow_api/delete_strategy",
  "method": "POST",
  "name": "GetDeleteStrategy",
  "reqType": "workflow.GetDeleteStrategyRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id"]
  },
  "resType": "workflow.GetDeleteStrategyResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Publish process. The purpose of this interface is to publish processes that are not internal to the project. */
export const PublishWorkflow = /*#__PURE__*/createAPI<workflow.PublishWorkflowRequest, workflow.PublishWorkflowResponse>({
  "url": "/api/workflow_api/publish",
  "method": "POST",
  "name": "PublishWorkflow",
  "reqType": "workflow.PublishWorkflowRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id", "has_collaborator", "env", "commit_id", "force", "workflow_version", "version_description"]
  },
  "resType": "workflow.PublishWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const CopyWorkflow = /*#__PURE__*/createAPI<workflow.CopyWorkflowRequest, workflow.CopyWorkflowResponse>({
  "url": "/api/workflow_api/copy",
  "method": "POST",
  "name": "CopyWorkflow",
  "reqType": "workflow.CopyWorkflowRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id"]
  },
  "resType": "workflow.CopyWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const CopyWkTemplateApi = /*#__PURE__*/createAPI<workflow.CopyWkTemplateApiRequest, workflow.CopyWkTemplateApiResponse>({
  "url": "/api/workflow_api/copy_wk_template",
  "method": "POST",
  "name": "CopyWkTemplateApi",
  "reqType": "workflow.CopyWkTemplateApiRequest",
  "reqMapping": {
    "body": ["workflow_ids", "target_space_id"]
  },
  "resType": "workflow.CopyWkTemplateApiResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetReleasedWorkflows = /*#__PURE__*/createAPI<workflow.GetReleasedWorkflowsRequest, workflow.GetReleasedWorkflowsResponse>({
  "url": "/api/workflow_api/released_workflows",
  "method": "POST",
  "name": "GetReleasedWorkflows",
  "reqType": "workflow.GetReleasedWorkflowsRequest",
  "reqMapping": {
    "body": ["page", "size", "type", "name", "workflow_ids", "tags", "space_id", "order_by", "login_user_create", "flow_mode", "workflow_filter_list"]
  },
  "resType": "workflow.GetReleasedWorkflowsResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetWorkflowReferences = /*#__PURE__*/createAPI<workflow.GetWorkflowReferencesRequest, workflow.GetWorkflowReferencesResponse>({
  "url": "/api/workflow_api/workflow_references",
  "method": "POST",
  "name": "GetWorkflowReferences",
  "reqType": "workflow.GetWorkflowReferencesRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id"]
  },
  "resType": "workflow.GetWorkflowReferencesResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Get a list of sample processes */
export const GetExampleWorkFlowList = /*#__PURE__*/createAPI<workflow.GetExampleWorkFlowListRequest, workflow.GetExampleWorkFlowListResponse>({
  "url": "/api/workflow_api/example_workflow_list",
  "method": "POST",
  "name": "GetExampleWorkFlowList",
  "reqType": "workflow.GetExampleWorkFlowListRequest",
  "reqMapping": {
    "body": ["page", "size", "name", "flow_mode", "checker"]
  },
  "resType": "workflow.GetExampleWorkFlowListResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Gets a list of processes. */
export const GetWorkFlowList = /*#__PURE__*/createAPI<workflow.GetWorkFlowListRequest, workflow.GetWorkFlowListResponse>({
  "url": "/api/workflow_api/workflow_list",
  "method": "POST",
  "name": "GetWorkFlowList",
  "reqType": "workflow.GetWorkFlowListRequest",
  "reqMapping": {
    "body": ["page", "size", "workflow_ids", "type", "name", "tags", "space_id", "status", "order_by", "login_user_create", "flow_mode", "schema_type_list", "project_id", "checker", "bind_biz_id", "bind_biz_type", "project_version"]
  },
  "resType": "workflow.GetWorkFlowListResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const QueryWorkflowNodeTypes = /*#__PURE__*/createAPI<workflow.QueryWorkflowNodeTypeRequest, workflow.QueryWorkflowNodeTypeResponse>({
  "url": "/api/workflow_api/node_type",
  "method": "POST",
  "name": "QueryWorkflowNodeTypes",
  "reqType": "workflow.QueryWorkflowNodeTypeRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id"]
  },
  "resType": "workflow.QueryWorkflowNodeTypeResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Canvas */
export const NodeTemplateList = /*#__PURE__*/createAPI<workflow.NodeTemplateListRequest, workflow.NodeTemplateListResponse>({
  "url": "/api/workflow_api/node_template_list",
  "method": "POST",
  "name": "NodeTemplateList",
  "reqType": "workflow.NodeTemplateListRequest",
  "reqMapping": {
    "body": ["need_types", "node_types"]
  },
  "resType": "workflow.NodeTemplateListResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const NodePanelSearch = /*#__PURE__*/createAPI<workflow.NodePanelSearchRequest, workflow.NodePanelSearchResponse>({
  "url": "/api/workflow_api/node_panel_search",
  "method": "POST",
  "name": "NodePanelSearch",
  "reqType": "workflow.NodePanelSearchRequest",
  "reqMapping": {
    "body": ["search_type", "space_id", "project_id", "search_key", "page_or_cursor", "page_size", "exclude_workflow_id"]
  },
  "resType": "workflow.NodePanelSearchResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetLLMNodeFCSettingsMerged = /*#__PURE__*/createAPI<workflow.GetLLMNodeFCSettingsMergedRequest, workflow.GetLLMNodeFCSettingsMergedResponse>({
  "url": "/api/workflow_api/llm_fc_setting_merged",
  "method": "POST",
  "name": "GetLLMNodeFCSettingsMerged",
  "reqType": "workflow.GetLLMNodeFCSettingsMergedRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id", "plugin_fc_setting", "workflow_fc_setting", "dataset_fc_setting"]
  },
  "resType": "workflow.GetLLMNodeFCSettingsMergedResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetLLMNodeFCSettingDetail = /*#__PURE__*/createAPI<workflow.GetLLMNodeFCSettingDetailRequest, workflow.GetLLMNodeFCSettingDetailResponse>({
  "url": "/api/workflow_api/llm_fc_setting_detail",
  "method": "POST",
  "name": "GetLLMNodeFCSettingDetail",
  "reqType": "workflow.GetLLMNodeFCSettingDetailRequest",
  "reqMapping": {
    "body": ["workflow_id", "space_id", "plugin_list", "workflow_list", "dataset_list"]
  },
  "resType": "workflow.GetLLMNodeFCSettingDetailResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Practice running process (test run) */
export const WorkFlowTestRun = /*#__PURE__*/createAPI<workflow.WorkFlowTestRunRequest, workflow.WorkFlowTestRunResponse>({
  "url": "/api/workflow_api/test_run",
  "method": "POST",
  "name": "WorkFlowTestRun",
  "reqType": "workflow.WorkFlowTestRunRequest",
  "reqMapping": {
    "body": ["workflow_id", "input", "space_id", "bot_id", "submit_commit_id", "commit_id", "project_id"]
  },
  "resType": "workflow.WorkFlowTestRunResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const WorkFlowTestResume = /*#__PURE__*/createAPI<workflow.WorkflowTestResumeRequest, workflow.WorkflowTestResumeResponse>({
  "url": "/api/workflow_api/test_resume",
  "method": "POST",
  "name": "WorkFlowTestResume",
  "reqType": "workflow.WorkflowTestResumeRequest",
  "reqMapping": {
    "body": ["workflow_id", "execute_id", "event_id", "data", "space_id"]
  },
  "resType": "workflow.WorkflowTestResumeResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const CancelWorkFlow = /*#__PURE__*/createAPI<workflow.CancelWorkFlowRequest, workflow.CancelWorkFlowResponse>({
  "url": "/api/workflow_api/cancel",
  "method": "POST",
  "name": "CancelWorkFlow",
  "reqType": "workflow.CancelWorkFlowRequest",
  "reqMapping": {
    "body": ["execute_id", "space_id", "workflow_id"]
  },
  "resType": "workflow.CancelWorkFlowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** View practice run history. */
export const GetWorkFlowProcess = /*#__PURE__*/createAPI<workflow.GetWorkflowProcessRequest, workflow.GetWorkflowProcessResponse>({
  "url": "/api/workflow_api/get_process",
  "method": "GET",
  "name": "GetWorkFlowProcess",
  "reqType": "workflow.GetWorkflowProcessRequest",
  "reqMapping": {
    "query": ["workflow_id", "space_id", "execute_id", "sub_execute_id", "need_async", "log_id", "node_id"]
  },
  "resType": "workflow.GetWorkflowProcessResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetNodeExecuteHistory = /*#__PURE__*/createAPI<workflow.GetNodeExecuteHistoryRequest, workflow.GetNodeExecuteHistoryResponse>({
  "url": "/api/workflow_api/get_node_execute_history",
  "method": "GET",
  "name": "GetNodeExecuteHistory",
  "reqType": "workflow.GetNodeExecuteHistoryRequest",
  "reqMapping": {
    "query": ["workflow_id", "space_id", "execute_id", "node_id", "is_batch", "batch_index", "node_type", "node_history_scene"]
  },
  "resType": "workflow.GetNodeExecuteHistoryResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetApiDetail = /*#__PURE__*/createAPI<workflow.GetApiDetailRequest, workflow.GetApiDetailResponse>({
  "url": "/api/workflow_api/apiDetail",
  "method": "GET",
  "name": "GetApiDetail",
  "reqType": "workflow.GetApiDetailRequest",
  "reqMapping": {
    "query": ["pluginID", "apiName", "space_id", "api_id", "project_id", "plugin_version"]
  },
  "resType": "workflow.GetApiDetailResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const WorkflowNodeDebugV2 = /*#__PURE__*/createAPI<workflow.WorkflowNodeDebugV2Request, workflow.WorkflowNodeDebugV2Response>({
  "url": "/api/workflow_api/nodeDebug",
  "method": "POST",
  "name": "WorkflowNodeDebugV2",
  "reqType": "workflow.WorkflowNodeDebugV2Request",
  "reqMapping": {
    "body": ["workflow_id", "node_id", "input", "batch", "space_id", "bot_id", "project_id", "setting"]
  },
  "resType": "workflow.WorkflowNodeDebugV2Response",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** file upload */
export const GetWorkflowUploadAuthToken = /*#__PURE__*/createAPI<workflow.GetUploadAuthTokenRequest, workflow.GetUploadAuthTokenResponse>({
  "url": "/api/workflow_api/upload/auth_token",
  "method": "POST",
  "name": "GetWorkflowUploadAuthToken",
  "reqType": "workflow.GetUploadAuthTokenRequest",
  "reqMapping": {
    "body": ["scene"]
  },
  "resType": "workflow.GetUploadAuthTokenResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const SignImageURL = /*#__PURE__*/createAPI<workflow.SignImageURLRequest, workflow.SignImageURLResponse>({
  "url": "/api/workflow_api/sign_image_url",
  "method": "POST",
  "name": "SignImageURL",
  "reqType": "workflow.SignImageURLRequest",
  "reqMapping": {
    "body": ["uri", "Scene"]
  },
  "resType": "workflow.SignImageURLResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** conversation */
export const CreateProjectConversationDef = /*#__PURE__*/createAPI<workflow.CreateProjectConversationDefRequest, workflow.CreateProjectConversationDefResponse>({
  "url": "/api/workflow_api/project_conversation/create",
  "method": "POST",
  "name": "CreateProjectConversationDef",
  "reqType": "workflow.CreateProjectConversationDefRequest",
  "reqMapping": {
    "body": ["project_id", "conversation_name", "space_id"]
  },
  "resType": "workflow.CreateProjectConversationDefResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const UpdateProjectConversationDef = /*#__PURE__*/createAPI<workflow.UpdateProjectConversationDefRequest, workflow.UpdateProjectConversationDefResponse>({
  "url": "/api/workflow_api/project_conversation/update",
  "method": "POST",
  "name": "UpdateProjectConversationDef",
  "reqType": "workflow.UpdateProjectConversationDefRequest",
  "reqMapping": {
    "body": ["project_id", "unique_id", "conversation_name", "space_id"]
  },
  "resType": "workflow.UpdateProjectConversationDefResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const DeleteProjectConversationDef = /*#__PURE__*/createAPI<workflow.DeleteProjectConversationDefRequest, workflow.DeleteProjectConversationDefResponse>({
  "url": "/api/workflow_api/project_conversation/delete",
  "method": "POST",
  "name": "DeleteProjectConversationDef",
  "reqType": "workflow.DeleteProjectConversationDefRequest",
  "reqMapping": {
    "body": ["project_id", "unique_id", "replace", "check_only", "space_id"]
  },
  "resType": "workflow.DeleteProjectConversationDefResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const ListProjectConversationDef = /*#__PURE__*/createAPI<workflow.ListProjectConversationRequest, workflow.ListProjectConversationResponse>({
  "url": "/api/workflow_api/project_conversation/list",
  "method": "GET",
  "name": "ListProjectConversationDef",
  "reqType": "workflow.ListProjectConversationRequest",
  "reqMapping": {
    "query": ["project_id", "create_method", "create_env", "cursor", "limit", "space_id", "nameLike", "connector_id", "project_version"]
  },
  "resType": "workflow.ListProjectConversationResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/**
 * Trace
 * List traces of historical execution
*/
export const ListRootSpans = /*#__PURE__*/createAPI<trace.ListRootSpansRequest, trace.ListRootSpansResponse>({
  "url": "/api/workflow_api/list_spans",
  "method": "POST",
  "name": "ListRootSpans",
  "reqType": "trace.ListRootSpansRequest",
  "reqMapping": {
    "body": ["start_at", "end_at", "limit", "desc_by_start_time", "offset", "workflow_id", "input", "status", "execute_mode"]
  },
  "resType": "trace.ListRootSpansResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetTraceSDK = /*#__PURE__*/createAPI<trace.GetTraceSDKRequest, trace.GetTraceSDKResponse>({
  "url": "/api/workflow_api/get_trace",
  "method": "POST",
  "name": "GetTraceSDK",
  "reqType": "trace.GetTraceSDKRequest",
  "reqMapping": {
    "query": ["log_id", "start_at", "end_at", "workflow_id", "execute_id"]
  },
  "resType": "trace.GetTraceSDKResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** App */
export const GetWorkflowDetail = /*#__PURE__*/createAPI<workflow.GetWorkflowDetailRequest, workflow.GetWorkflowDetailResponse>({
  "url": "/api/workflow_api/workflow_detail",
  "method": "POST",
  "name": "GetWorkflowDetail",
  "reqType": "workflow.GetWorkflowDetailRequest",
  "reqMapping": {
    "body": ["workflow_ids", "space_id"]
  },
  "resType": "workflow.GetWorkflowDetailResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetWorkflowDetailInfo = /*#__PURE__*/createAPI<workflow.GetWorkflowDetailInfoRequest, workflow.GetWorkflowDetailInfoResponse>({
  "url": "/api/workflow_api/workflow_detail_info",
  "method": "POST",
  "name": "GetWorkflowDetailInfo",
  "reqType": "workflow.GetWorkflowDetailInfoRequest",
  "reqMapping": {
    "body": ["workflow_filter_list", "space_id"]
  },
  "resType": "workflow.GetWorkflowDetailInfoResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const ValidateTree = /*#__PURE__*/createAPI<workflow.ValidateTreeRequest, workflow.ValidateTreeResponse>({
  "url": "/api/workflow_api/validate_tree",
  "method": "POST",
  "name": "ValidateTree",
  "reqType": "workflow.ValidateTreeRequest",
  "reqMapping": {
    "body": ["workflow_id", "bind_project_id", "bind_bot_id", "schema"]
  },
  "resType": "workflow.ValidateTreeResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** chat flow role config */
export const GetChatFlowRole = /*#__PURE__*/createAPI<workflow.GetChatFlowRoleRequest, workflow.GetChatFlowRoleResponse>({
  "url": "/api/workflow_api/chat_flow_role/get",
  "method": "GET",
  "name": "GetChatFlowRole",
  "reqType": "workflow.GetChatFlowRoleRequest",
  "reqMapping": {
    "query": ["workflow_id", "connector_id", "is_debug", "ext"]
  },
  "resType": "workflow.GetChatFlowRoleResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const CreateChatFlowRole = /*#__PURE__*/createAPI<workflow.CreateChatFlowRoleRequest, workflow.CreateChatFlowRoleResponse>({
  "url": "/api/workflow_api/chat_flow_role/create",
  "method": "POST",
  "name": "CreateChatFlowRole",
  "reqType": "workflow.CreateChatFlowRoleRequest",
  "reqMapping": {
    "body": ["chat_flow_role"]
  },
  "resType": "workflow.CreateChatFlowRoleResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const DeleteChatFlowRole = /*#__PURE__*/createAPI<workflow.DeleteChatFlowRoleRequest, workflow.DeleteChatFlowRoleResponse>({
  "url": "/api/workflow_api/chat_flow_role/delete",
  "method": "POST",
  "name": "DeleteChatFlowRole",
  "reqType": "workflow.DeleteChatFlowRoleRequest",
  "reqMapping": {
    "body": ["WorkflowID", "ConnectorID", "ID"]
  },
  "resType": "workflow.DeleteChatFlowRoleResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** App Release Management */
export const ListPublishWorkflow = /*#__PURE__*/createAPI<workflow.ListPublishWorkflowRequest, workflow.ListPublishWorkflowResponse>({
  "url": "/api/workflow_api/list_publish_workflow",
  "method": "POST",
  "name": "ListPublishWorkflow",
  "reqType": "workflow.ListPublishWorkflowRequest",
  "reqMapping": {
    "body": ["space_id", "owner_id", "name", "order_last_publish_time", "order_total_token", "size", "cursor_id", "workflow_ids"]
  },
  "resType": "workflow.ListPublishWorkflowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Open API */
export const OpenAPIRunFlow = /*#__PURE__*/createAPI<workflow.OpenAPIRunFlowRequest, workflow.OpenAPIRunFlowResponse>({
  "url": "/v1/workflow/run",
  "method": "POST",
  "name": "OpenAPIRunFlow",
  "reqType": "workflow.OpenAPIRunFlowRequest",
  "reqMapping": {
    "body": ["workflow_id", "parameters", "ext", "bot_id", "is_async", "execute_mode", "version", "connector_id", "app_id", "project_id"]
  },
  "resType": "workflow.OpenAPIRunFlowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const OpenAPIStreamRunFlow = /*#__PURE__*/createAPI<workflow.OpenAPIRunFlowRequest, workflow.OpenAPIStreamRunFlowResponse>({
  "url": "/v1/workflow/stream_run",
  "method": "POST",
  "name": "OpenAPIStreamRunFlow",
  "reqType": "workflow.OpenAPIRunFlowRequest",
  "reqMapping": {
    "body": ["workflow_id", "parameters", "ext", "bot_id", "is_async", "execute_mode", "version", "connector_id", "app_id", "project_id"]
  },
  "resType": "workflow.OpenAPIStreamRunFlowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const OpenAPIStreamResumeFlow = /*#__PURE__*/createAPI<workflow.OpenAPIStreamResumeFlowRequest, workflow.OpenAPIStreamRunFlowResponse>({
  "url": "/v1/workflow/stream_resume",
  "method": "POST",
  "name": "OpenAPIStreamResumeFlow",
  "reqType": "workflow.OpenAPIStreamResumeFlowRequest",
  "reqMapping": {
    "body": ["event_id", "interrupt_type", "resume_data", "ext", "workflow_id", "connector_id"]
  },
  "resType": "workflow.OpenAPIStreamRunFlowResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const OpenAPIGetWorkflowRunHistory = /*#__PURE__*/createAPI<workflow.GetWorkflowRunHistoryRequest, workflow.GetWorkflowRunHistoryResponse>({
  "url": "/v1/workflow/get_run_history",
  "method": "GET",
  "name": "OpenAPIGetWorkflowRunHistory",
  "reqType": "workflow.GetWorkflowRunHistoryRequest",
  "reqMapping": {
    "query": ["workflow_id", "execute_id"]
  },
  "resType": "workflow.GetWorkflowRunHistoryResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const OpenAPIChatFlowRun = /*#__PURE__*/createAPI<workflow.ChatFlowRunRequest, workflow.ChatFlowRunResponse>({
  "url": "/v1/workflows/chat",
  "method": "POST",
  "name": "OpenAPIChatFlowRun",
  "reqType": "workflow.ChatFlowRunRequest",
  "reqMapping": {
    "body": ["workflow_id", "parameters", "ext", "bot_id", "execute_mode", "version", "connector_id", "app_id", "conversation_id", "additional_messages", "project_id", "suggest_reply_info"]
  },
  "resType": "workflow.ChatFlowRunResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const OpenAPIGetWorkflowInfo = /*#__PURE__*/createAPI<workflow.OpenAPIGetWorkflowInfoRequest, workflow.OpenAPIGetWorkflowInfoResponse>({
  "url": "/v1/workflows/:workflow_id",
  "method": "GET",
  "name": "OpenAPIGetWorkflowInfo",
  "reqType": "workflow.OpenAPIGetWorkflowInfoRequest",
  "reqMapping": {
    "path": ["workflow_id"],
    "query": ["connector_id", "is_debug", "caller"]
  },
  "resType": "workflow.OpenAPIGetWorkflowInfoResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
/** Card Selector APIs */
export const GetCardList = /*#__PURE__*/createAPI<workflow.GetCardListRequest, workflow.GetCardListResponse>({
  "url": "/api/workflow_api/card/list",
  "method": "POST",
  "name": "GetCardList",
  "reqType": "workflow.GetCardListRequest",
  "reqMapping": {
    "body": ["sassWorkspaceId", "pageNo", "pageSize", "searchValue", "cardName", "cardCode"]
  },
  "resType": "workflow.GetCardListResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});
export const GetCardDetail = /*#__PURE__*/createAPI<workflow.GetCardDetailRequest, workflow.GetCardDetailResponse>({
  "url": "/api/workflow_api/card/detail",
  "method": "POST",
  "name": "GetCardDetail",
  "reqType": "workflow.GetCardDetailRequest",
  "reqMapping": {
    "body": ["cardId", "sassWorkspaceId"]
  },
  "resType": "workflow.GetCardDetailResponse",
  "schemaRoot": "api://schemas/idl_workflow_workflow_svc",
  "service": "workflow"
});