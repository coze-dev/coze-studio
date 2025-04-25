include "./prompt/prompt.thrift"
include "./agent/agent.thrift"
include "./plugin/plugin.thrift"
include "./data_engine/dataset/dataset.thrift"
include "./data_engine/dataset/document.thrift"
include "./data_engine/dataset/slice.thrift"
include "./data_engine/ocean_cloud_memory/knowledge/document2.thrift"

include "./data_engine/ocean_cloud_memory/kvmemory/kvmemory.thrift"
include "./data_engine/ocean_cloud_memory/kvmemory/project_memory.thrift"
include "./bot_platform/ocean_cloud_workflow/workflow.thrift"
include "./bot_platform/ocean_cloud_workflow/trace.thrift"
include "./flow/devops/debugger/flow.devops.debugger.coze.thrift"
include "./conversation/run.thrift"
include "./conversation/message.thrift"
include "./conversation/conversation.thrift"
include "./intelligence/intelligence.thrift"

namespace go coze

service IntelligenceService extends intelligence.IntelligenceService {}

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource")

    agent.UpdateDraftBotInfoResponse UpdateDraftBotInfo(1:agent.UpdateDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot")
    agent.DraftBotCreateResponse DraftBotCreate(1:agent.DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    agent.GetDraftBotInfoResponse GetDraftBotInfo(1:agent.GetDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot")

    kvmemory.GetSysVariableConfResponse GetSysVariableConf(1:kvmemory.GetSysVariableConfRequest req)(api.get='/api/memory/sys_variable_conf', api.category="memory")
    kvmemory.SetKvMemoryResp SetKvMemory(1: kvmemory.SetKvMemoryReq req)(api.post='/api/memory/variable/upsert', api.category="memory",agw.preserve_base="true")
    project_memory.GetProjectVariableListResp GetProjectVariableList(1:project_memory.GetProjectVariableListReq req)(api.get='/api/memory/project/variable/meta_list', api.category="memory_project")
    project_memory.UpdateProjectVariableResp UpdateProjectVariable(1:project_memory.UpdateProjectVariableReq req)(api.post='/api/memory/project/variable/meta_update', api.category="memory_project")
    project_memory.GetMemoryVariableMetaResp GetMemoryVariableMeta(1:project_memory.GetMemoryVariableMetaReq req)(api.post='/api/memory/variable/get_meta', api.category="memory",agw.preserve_base="true")

    run.AgentRunResponse AgentRun(1: run.AgentRunRequest request)(api.post='/api/conversation/chat', api.category="conversation", api.gen_path= "agent_run")
    message.GetMessageListResponse GetMessageList(1: message.GetMessageListRequest request)(api.post='/api/conversation/get_message_list', api.category="conversation", api.gen_path= "message")
    message.DeleteMessageResponse DeleteMessage(1: message.DeleteMessageRequest request)(api.post='/api/conversation/delete_message', api.category="conversation", api.gen_path= "message")
    message.BreakMessageResponse BreakMessage(1: message.BreakMessageRequest request)(api.post='/api/conversation/break_message', api.category="conversation", api.gen_path= "message")
    conversation.ClearConversationCtxResponse ClearConversationCtx(1: conversation.ClearConversationCtxRequest request)(api.post='/api/conversation/create_section', api.category="conversation", api.gen_path= "conversation")
    conversation.ClearConversationHistoryResponse ClearConversationHistory(1: conversation.ClearConversationHistoryRequest request)(api.post='/api/conversation/clear_message', api.category="conversation", api.gen_path= "conversation")

    plugin.RegisterPluginMetaResponse RegisterPluginMeta(1: plugin.RegisterPluginMetaRequest request) (api.post = '/api/plugin_api/register_plugin_meta', api.category = "plugin")
    plugin.UpdatePluginMetaResponse UpdatePluginMeta(1: plugin.UpdatePluginMetaRequest request) (api.post = '/api/plugin_api/update_plugin_meta', api.category = "plugin")
    plugin.UpdatePluginResponse UpdatePlugin(1: plugin.UpdatePluginRequest request) (api.post = '/api/plugin_api/update', api.category = "plugin")
    plugin.DelPluginResponse DelPlugin(1: plugin.DelPluginRequest request) (api.post = '/api/plugin_api/del_plugin', api.category = "plugin", api.gen_path = 'plugin', agw.preserve_base = "true")
    plugin.GetPlaygroundPluginListResponse GetPlaygroundPluginList(1: plugin.GetPlaygroundPluginListRequest request) (api.post = '/api/plugin_api/get_playground_plugin_list', api.category = "plugin")
    plugin.GetPluginAPIsResponse GetPluginAPIs(1: plugin.GetPluginAPIsRequest request) (api.post = '/api/plugin_api/get_plugin_apis', api.category = "plugin")
    plugin.GetPluginInfoResponse GetPluginInfo(1: plugin.GetPluginInfoRequest request) (api.post = '/api/plugin_api/get_plugin_info', api.category = "plugin")
    plugin.GetUpdatedAPIsResponse GetUpdatedAPIs(1: plugin.GetUpdatedAPIsRequest request) (api.post = '/api/plugin_api/get_updated_apis', api.category = "plugin")
    plugin.PublishPluginResponse PublishPlugin(1: plugin.PublishPluginRequest request) (api.post = '/api/plugin_api/publish_plugin', api.category = "plugin")
    plugin.GetBotDefaultParamsResponse GetBotDefaultParams(1: plugin.GetBotDefaultParamsRequest request) (api.post = '/api/plugin_api/get_bot_default_params', api.category = "plugin")
    plugin.UpdateBotDefaultParamsResponse UpdateBotDefaultParams(1: plugin.UpdateBotDefaultParamsRequest request) (api.post = '/api/plugin_api/update_bot_default_params', api.category = "plugin")
    plugin.DeleteBotDefaultParamsResponse DeleteBotDefaultParams(1: plugin.DeleteBotDefaultParamsRequest request) (api.post = '/api/plugin_api/delete_bot_default_params', api.category = "plugin")
    plugin.CreateAPIResponse CreateAPI(1: plugin.CreateAPIRequest request) (api.post = '/api/plugin_api/create_api', api.category = "plugin", api.gen_path = 'plugin', agw.preserve_base = "true")
    plugin.UpdateAPIResponse UpdateAPI(1: plugin.UpdateAPIRequest request) (api.post = '/api/plugin_api/update_api', api.category = "plugin", api.gen_path = 'plugin', agw.preserve_base = "true")
    plugin.DeleteAPIResponse DeleteAPI(1: plugin.DeleteAPIRequest request) (api.post = '/api/plugin_api/delete_api', api.category = "plugin", api.gen_path = 'plugin', agw.preserve_base = "true")

    /***** workflow begin *****/
    // 创建流程
    workflow.CreateWorkflowResponse CreateWorkflow(1:workflow.CreateWorkflowRequest request) (api.post='/api/workflow_api/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 获取流程编辑态详情
    workflow.GetCanvasInfoResponse GetCanvasInfo(1:workflow.GetCanvasInfoRequest request) (api.post='/api/workflow_api/canvas', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 保存流程
    workflow.SaveWorkflowResponse SaveWorkflow(1:workflow.SaveWorkflowRequest request) (api.post='/api/workflow_api/save', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.UpdateWorkflowMetaResponse UpdateWorkflowMeta(1:workflow.UpdateWorkflowMetaRequest request) (api.post='/api/workflow_api/update_meta', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteWorkflowResponse DeleteWorkflow(1:workflow.DeleteWorkflowRequest request) (api.post='/api/workflow_api/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.BatchDeleteWorkflowResponse BatchDeleteWorkflow(1:workflow.BatchDeleteWorkflowRequest request) (api.post='/api/workflow_api/batch_delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetDeleteStrategyResponse GetDeleteStrategy(1: workflow.GetDeleteStrategyRequest request)(api.post='/api/workflow_api/delete_strategy', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 发布流程。该接口的用途是发布非 project 内部的流程。
    workflow.PublishWorkflowResponse PublishWorkflow(1:workflow.PublishWorkflowRequest request) (api.post='/api/workflow_api/publish', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CopyWorkflowResponse CopyWorkflow(1:workflow.CopyWorkflowRequest request) (api.post='/api/workflow_api/copy', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CopyWkTemplateApiResponse CopyWkTemplateApi(1:workflow.CopyWkTemplateApiRequest request) (api.post='/api/workflow_api/copy_wk_template', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetReleasedWorkflowsResponse GetReleasedWorkflows(1: workflow.GetReleasedWorkflowsRequest request) (api.post='/api/workflow_api/released_workflows', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetWorkflowReferencesResponse GetWorkflowReferences(1: workflow.GetWorkflowReferencesRequest request) (api.post='/api/workflow_api/workflow_references', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 获取流程列表。
    workflow.GetWorkFlowListResponse GetWorkFlowList(1: workflow.GetWorkFlowListRequest request) (api.post='/api/workflow_api/workflow_list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.QueryWorkflowNodeTypeResponse QueryWorkflowNodeTypes(1: workflow.QueryWorkflowNodeTypeRequest request)(api.post="/api/workflow_api/node_type", api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 画布
    workflow.NodeTemplateListResponse NodeTemplateList(1: workflow.NodeTemplateListRequest request)(api.post='/api/workflow_api/node_template_list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.NodePanelSearchResponse NodePanelSearch(1: workflow.NodePanelSearchRequest request)(api.post='/api/workflow_api/node_panel_search', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetLLMNodeFCSettingsMergedResponse GetLLMNodeFCSettingsMerged(1: workflow.GetLLMNodeFCSettingsMergedRequest req)(api.post='/api/workflow_api/llm_fc_setting_merged', api.category="workflow_api", api.gen_path="workflow_trace", agw.preserve_base = "true")
    workflow.GetLLMNodeFCSettingDetailResponse GetLLMNodeFCSettingDetail(1: workflow.GetLLMNodeFCSettingDetailRequest req)(api.post='/api/workflow_api/llm_fc_setting_detail', api.category="workflow_api", api.gen_path="workflow_trace", agw.preserve_base = "true")
   // 试运行流程（test run）
    workflow.WorkFlowTestRunResponse WorkFlowTestRun(1:workflow.WorkFlowTestRunRequest request) (api.post='/api/workflow_api/test_run', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.WorkflowTestResumeResponse WorkFlowTestResume(1:workflow.WorkflowTestResumeRequest request) (api.post='/api/workflow_api/test_resume', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CancelWorkFlowResponse CancelWorkFlow(1:workflow.CancelWorkFlowRequest request) (api.post='/api/workflow_api/cancel', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 查看试运行执行历史。
    workflow.GetWorkflowProcessResponse GetWorkFlowProcess(1:workflow.GetWorkflowProcessRequest request)(api.get='/api/workflow_api/get_process', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetNodeExecuteHistoryResponse GetNodeExecuteHistory(1:workflow.GetNodeExecuteHistoryRequest request)(api.get='/api/workflow_api/get_node_execute_history', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetApiDetailResponse GetApiDetail(1: workflow.GetApiDetailRequest request) (api.get='/api/workflow_api/apiDetail', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.WorkflowNodeDebugV2Response WorkflowNodeDebugV2(1: workflow.WorkflowNodeDebugV2Request request) (api.post='/api/workflow_api/nodeDebug', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 文件上传
    workflow.SignImageURLResponse SignImageURL(1: workflow.SignImageURLRequest request)(api.post='/api/workflow_api/sign_image_url', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // conversation
    workflow.CreateProjectConversationDefResponse CreateProjectConversationDef(1: workflow.CreateProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.UpdateProjectConversationDefResponse UpdateProjectConversationDef(1: workflow.UpdateProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/update', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteProjectConversationDefResponse DeleteProjectConversationDef(1: workflow.DeleteProjectConversationDefRequest request)(api.post = '/api/workflow_api/project_conversation/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.ListProjectConversationResponse ListProjectConversationDef(1: workflow.ListProjectConversationRequest request)(api.get = '/api/workflow_api/project_conversation/list', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // Trace
    // 列出历史执行的trace
    trace.ListRootSpansResponse ListRootSpans (1: trace.ListRootSpansRequest req)(api.post='/api/workflow_api/list_spans', api.category="workflow_trace", api.gen_path="workflow_trace", agw.preserve_base = "true")
    trace.GetTraceSDKResponse GetTraceSDK (1: trace.GetTraceSDKRequest req)(api.post='/api/workflow_api/get_trace', api.category="workflow_trace", api.gen_path="workflow_trace", agw.preserve_base = "true")
    // Project
    workflow.GetWorkflowDetailResponse GetWorkflowDetail(1: workflow.GetWorkflowDetailRequest request) (api.post='/api/workflow_api/workflow_detail', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.GetWorkflowDetailInfoResponse GetWorkflowDetailInfo(1: workflow.GetWorkflowDetailInfoRequest request) (api.post='/api/workflow_api/workflow_detail_info', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.ValidateTreeResponse ValidateTree(1: workflow.ValidateTreeRequest request) (api.post='/api/workflow_api/validate_tree', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // chat flow role config
    workflow.GetChatFlowRoleResponse GetChatFlowRole(1: workflow.GetChatFlowRoleRequest request) (api.get='/api/workflow_api/chat_flow_role/get', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.CreateChatFlowRoleResponse CreateChatFlowRole(1: workflow.CreateChatFlowRoleRequest request) (api.post='/api/workflow_api/chat_flow_role/create', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    workflow.DeleteChatFlowRoleResponse DeleteChatFlowRole(1: workflow.DeleteChatFlowRoleRequest request) (api.post='/api/workflow_api/chat_flow_role/delete', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // project 发布管理
    workflow.ListPublishWorkflowResponse ListPublishWorkflow(1: workflow.ListPublishWorkflowRequest request) (api.post='/api/workflow_api/list_publish_workflow', api.category="workflow_api", api.gen_path="workflow_api", agw.preserve_base = "true")
    // 测试集 TODO 代码生成报错，后面再看
    //case manage
    //flow.devops.debugger.coze.SaveCaseDataResp SaveCaseData(1: flow.devops.debugger.coze.SaveCaseDataReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/save")
    //flow.devops.debugger.coze.DeleteCaseDataResp DeleteCaseData(1: flow.devops.debugger.coze.DeleteCaseDataReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/delete")
    //flow.devops.debugger.coze.CheckCaseDuplicateResp CheckCaseDuplicate(1: flow.devops.debugger.coze.CheckCaseDuplicateReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/check")
    //case schema
    //flow.devops.debugger.coze.GetSchemaByIDResp GetSchemaByID(1: flow.devops.debugger.coze.GetSchemaByIDReq req)(api.post="/api/devops/debugger/v1/coze/testcase/casedata/schema")
    /**** workflow end ****/

    // 知识库相关
    dataset.CreateDatasetResponse CreateDataset(1:dataset.CreateDatasetRequest req) (api.post='/api/knowledge/create', api.category="knowledge",agw.preserve_base="true")
    dataset.DatasetDetailResponse DatasetDetail(1:dataset.DatasetDetailRequest req) (api.post='/api/knowledge/detail', api.category="knowledge",agw.preserve_base="true")
    dataset.ListDatasetResponse ListDataset(1:dataset.ListDatasetRequest req) (api.post='/api/knowledge/list', api.category="knowledge",agw.preserve_base="true")
    dataset.DeleteDatasetResponse DeleteDataset(1:dataset.DeleteDatasetRequest req) (api.post='/api/knowledge/delete', api.category="knowledge",agw.preserve_base="true")
    dataset.UpdateDatasetResponse UpdateDataset(1:dataset.UpdateDatasetRequest req) (api.post='/api/knowledge/update', api.category="knowledge",agw.preserve_base="true")
    // Document相关
    document.CreateDocumentResponse CreateDocument(1:document.CreateDocumentRequest req) (api.post='/api/knowledge/document/create', api.category="knowledge",agw.preserve_base="true")
    document.ListDocumentResponse ListDocument(1:document.ListDocumentRequest req) (api.post='/api/knowledge/document/list', api.category="knowledge",agw.preserve_base="true")
    document.DeleteDocumentResponse DeleteDocument(1:document.DeleteDocumentRequest req) (api.post='/api/knowledge/document/delete', api.category="knowledge",agw.preserve_base="true")
    document.UpdateDocumentResponse UpdateDocument(1:document.UpdateDocumentRequest req) (api.post='/api/knowledge/document/update', api.category="knowledge",agw.preserve_base="true")
    document.GetDocumentProgressResponse GetDocumentProgress(1:document.GetDocumentProgressRequest req) (api.post='/api/knowledge/document/progress/get', api.category="knowledge",agw.preserve_base="true")
    document.ResegmentResponse Resegment(1:document.ResegmentRequest req) (api.post='/api/knowledge/document/resegment', api.category="knowledge",agw.preserve_base="true")
    document.UpdatePhotoCaptionResponse UpdatePhotoCaption(1:document.UpdatePhotoCaptionRequest req) (api.post='/api/knowledge/photo/caption', api.category="knowledge",agw.preserve_base="true")
    document.ListPhotoResponse ListPhoto(1:document.ListPhotoRequest req) (api.post='/api/knowledge/photo/list', api.category="knowledge",agw.preserve_base="true")
    document.PhotoDetailResponse PhotoDetail(1:document.PhotoDetailRequest req) (api.post='/api/knowledge/photo/detail', api.category="knowledge",agw.preserve_base="true")
    document.GetTableSchemaResponse GetTableSchema(1:document.GetTableSchemaRequest req) (api.post='/api/knowledge/table_schema/get', api.category="knowledge",agw.preserve_base="true")
    document.ValidateTableSchemaResponse ValidateTableSchema(1:document.ValidateTableSchemaRequest req) (api.post='/api/knowledge/table_schema/validate', api.category="knowledge",agw.preserve_base="true")
    document2.GetDocumentTableInfoResponse GetDocumentTableInfo(1:document2.GetDocumentTableInfoRequest req) (api.get='/api/memory/doc_table_info', api.category="memory", agw.preserve_base="true")
    // slice相关
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")
    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")
    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")
    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")

}