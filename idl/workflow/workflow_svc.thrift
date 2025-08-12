include "../base.thrift"
include "workflow.thrift"
include "../resource/resource.thrift"
include "trace.thrift"
include "../resource/resource_common.thrift"

namespace go workflow

service WorkflowService {
    // Create process
    workflow.CreateWorkflowResponse CreateWorkflow(1:workflow.CreateWorkflowRequest request) (api.post='/api/workflow_api/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // query process
    workflow.GetCanvasInfoResponse GetCanvasInfo(1:workflow.GetCanvasInfoRequest request) (api.post='/api/workflow_api/canvas', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetHistorySchemaResponse GetHistorySchema(1:workflow.GetHistorySchemaRequest request) (api.post='/api/workflow_api/history_schema', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // save process
    workflow.SaveWorkflowResponse SaveWorkflow(1:workflow.SaveWorkflowRequest request) (api.post='/api/workflow_api/save', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.UpdateWorkflowMetaResponse UpdateWorkflowMeta(1:workflow.UpdateWorkflowMetaRequest request) (api.post='/api/workflow_api/update_meta', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteWorkflowResponse DeleteWorkflow(1:workflow.DeleteWorkflowRequest request) (api.post='/api/workflow_api/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.BatchDeleteWorkflowResponse BatchDeleteWorkflow(1:workflow.BatchDeleteWorkflowRequest request) (api.post='/api/workflow_api/batch_delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetDeleteStrategyResponse GetDeleteStrategy(1: workflow.GetDeleteStrategyRequest request)(api.post='/api/workflow_api/delete_strategy', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // Publish process. The purpose of this interface is to publish processes that are not internal to the project.
    workflow.PublishWorkflowResponse PublishWorkflow(1:workflow.PublishWorkflowRequest request) (api.post='/api/workflow_api/publish', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CopyWorkflowResponse CopyWorkflow(1:workflow.CopyWorkflowRequest request) (api.post='/api/workflow_api/copy', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CopyWkTemplateApiResponse CopyWkTemplateApi(1:workflow.CopyWkTemplateApiRequest request) (api.post='/api/workflow_api/copy_wk_template', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 导出工作流
    workflow.ExportWorkflowResponse ExportWorkflow(1:workflow.ExportWorkflowRequest request) (api.post='/api/workflow_api/export', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 导入工作流
    workflow.ImportWorkflowResponse ImportWorkflow(1:workflow.ImportWorkflowRequest request) (api.post='/api/workflow_api/import', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 验证导入包
    workflow.ValidateImportResponse ValidateImport(1:workflow.ValidateImportRequest request) (api.post='/api/workflow_api/validate_import', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetReleasedWorkflowsResponse GetReleasedWorkflows(1: workflow.GetReleasedWorkflowsRequest request) (api.post='/api/workflow_api/released_workflows', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetWorkflowReferencesResponse GetWorkflowReferences(1: workflow.GetWorkflowReferencesRequest request) (api.post='/api/workflow_api/workflow_references', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // Get a list of sample processes
    workflow.GetExampleWorkFlowListResponse GetExampleWorkFlowList(1: workflow.GetExampleWorkFlowListRequest request)(api.post='/api/workflow_api/example_workflow_list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")

    // Gets a list of processes.
    workflow.GetWorkFlowListResponse GetWorkFlowList(1: workflow.GetWorkFlowListRequest request) (api.post='/api/workflow_api/workflow_list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.QueryWorkflowNodeTypeResponse QueryWorkflowNodeTypes(1: workflow.QueryWorkflowNodeTypeRequest request)(api.post="/api/workflow_api/node_type", api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // Canvas
    workflow.NodeTemplateListResponse NodeTemplateList(1: workflow.NodeTemplateListRequest request)(api.post='/api/workflow_api/node_template_list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.NodePanelSearchResponse NodePanelSearch(1: workflow.NodePanelSearchRequest request)(api.post='/api/workflow_api/node_panel_search', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetLLMNodeFCSettingsMergedResponse GetLLMNodeFCSettingsMerged(1: workflow.GetLLMNodeFCSettingsMergedRequest req)(api.post='/api/workflow_api/llm_fc_setting_merged', api.category="workflow_api", api.gen_path="workflow_trace", agw.preserve_base = "true")
    workflow.GetLLMNodeFCSettingDetailResponse GetLLMNodeFCSettingDetail(1: workflow.GetLLMNodeFCSettingDetailRequest req)(api.post='/api/workflow_api/llm_fc_setting_detail', api.category="workflow_api", api.gen_path="workflow_trace", agw.preserve_base = "true")
   // Practice running process (test run)
    workflow.WorkFlowTestRunResponse WorkFlowTestRun(1:workflow.WorkFlowTestRunRequest request) (api.post='/api/workflow_api/test_run', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.WorkflowTestResumeResponse WorkFlowTestResume(1:workflow.WorkflowTestResumeRequest request) (api.post='/api/workflow_api/test_resume', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CancelWorkFlowResponse CancelWorkFlow(1:workflow.CancelWorkFlowRequest request) (api.post='/api/workflow_api/cancel', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // View practice run history.
    workflow.GetWorkflowProcessResponse GetWorkFlowProcess(1:workflow.GetWorkflowProcessRequest request)(api.get='/api/workflow_api/get_process', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetNodeExecuteHistoryResponse GetNodeExecuteHistory(1:workflow.GetNodeExecuteHistoryRequest request)(api.get='/api/workflow_api/get_node_execute_history', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetApiDetailResponse GetApiDetail(1: workflow.GetApiDetailRequest request) (api.get='/api/workflow_api/apiDetail', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.WorkflowNodeDebugV2Response WorkflowNodeDebugV2(1: workflow.WorkflowNodeDebugV2Request request) (api.post='/api/workflow_api/nodeDebug', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")

    // file upload
    workflow.GetUploadAuthTokenResponse GetWorkflowUploadAuthToken(1: workflow.GetUploadAuthTokenRequest request)(api.post = '/api/workflow_api/upload/auth_token', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.SignImageURLResponse SignImageURL(1: workflow.SignImageURLRequest request)(api.post='/api/workflow_api/sign_image_url', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // conversation
    workflow.CreateProjectConversationDefResponse CreateProjectConversationDef(1: workflow.CreateProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.UpdateProjectConversationDefResponse UpdateProjectConversationDef(1: workflow.UpdateProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/update', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteProjectConversationDefResponse DeleteProjectConversationDef(1: workflow.DeleteProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.ListProjectConversationResponse ListProjectConversationDef(1: workflow.ListProjectConversationRequest request)(api.get = '/api/workflow_api/project_conversation/list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // Trace
    // List traces of historical execution
    trace.ListRootSpansResponse ListRootSpans (1: trace.ListRootSpansRequest req)(api.post='/api/workflow_api/list_spans', api.category="workflow_trace", api.gen_path="workflow_trace", agw.preserve_base = "true")
    trace.GetTraceSDKResponse GetTraceSDK (1: trace.GetTraceSDKRequest req)(api.post='/api/workflow_api/get_trace', api.category="workflow_trace", api.gen_path="workflow_trace", agw.preserve_base = "true")
    // App
    workflow.GetWorkflowDetailResponse GetWorkflowDetail(1: workflow.GetWorkflowDetailRequest request) (api.post='/api/workflow_api/workflow_detail', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetWorkflowDetailInfoResponse GetWorkflowDetailInfo(1: workflow.GetWorkflowDetailInfoRequest request) (api.post='/api/workflow_api/workflow_detail_info', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.ValidateTreeResponse ValidateTree(1: workflow.ValidateTreeRequest request) (api.post='/api/workflow_api/validate_tree', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // chat flow role config
    workflow.GetChatFlowRoleResponse GetChatFlowRole(1: workflow.GetChatFlowRoleRequest request) (api.get='/api/workflow_api/chat_flow_role/get', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CreateChatFlowRoleResponse CreateChatFlowRole(1: workflow.CreateChatFlowRoleRequest request) (api.post='/api/workflow_api/chat_flow_role/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteChatFlowRoleResponse DeleteChatFlowRole(1: workflow.DeleteChatFlowRoleRequest request) (api.post='/api/workflow_api/chat_flow_role/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // App Release Management
    workflow.ListPublishWorkflowResponse ListPublishWorkflow(1: workflow.ListPublishWorkflowRequest request) (api.post='/api/workflow_api/list_publish_workflow', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")

    // Open API
    workflow.OpenAPIRunFlowResponse OpenAPIRunFlow(1: workflow.OpenAPIRunFlowRequest request)(api.post = "/v1/workflow/run", api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_open_api" )
    workflow.OpenAPIStreamRunFlowResponse OpenAPIStreamRunFlow(1: workflow.OpenAPIRunFlowRequest request)(api.post = "/v1/workflow/stream_run", api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_open_api")
    workflow.OpenAPIStreamRunFlowResponse OpenAPIStreamResumeFlow(1: workflow.OpenAPIStreamResumeFlowRequest request)(api.post = "/v1/workflow/stream_resume", api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_open_api")
    workflow.GetWorkflowRunHistoryResponse OpenAPIGetWorkflowRunHistory(1:workflow.GetWorkflowRunHistoryRequest request)(api.get='/v1/workflow/get_run_history', api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_api", agw.preserve_base = "false")
    workflow.ChatFlowRunResponse OpenAPIChatFlowRun(1: workflow.ChatFlowRunRequest request)(api.post = "/v1/workflows/chat", api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_open_api")
    workflow.OpenAPIGetWorkflowInfoResponse OpenAPIGetWorkflowInfo(1: workflow.OpenAPIGetWorkflowInfoRequest request)(api.get = "/v1/workflows/:workflow_id", api.category="workflow_open_api", api.tag="openapi", api.gen_path="workflow_open_api")
}
