include "./prompt/prompt.thrift"
include "./agent/agent.thrift"
include "./plugin/plugin.thrift"
include "./memory/memory.thrift"
include "./data_engine/dataset/dataset.thrift"
include "./data_engine/dataset/document.thrift"
include "./data_engine/dataset/slice.thrift"
include "./data_engine/ocean_cloud_memory/knowledge/document2.thrift"


namespace go coze

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource")

    agent.UpdateDraftBotInfoResponse UpdateDraftBotInfo(1:agent.UpdateDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot")
    agent.DraftBotCreateResponse DraftBotCreate(1:agent.DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    agent.GetDraftBotInfoResponse GetDraftBotInfo(1:agent.GetDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot")

    memory.GetSysVariableConfResponse GetSysVariableConf(1:memory.GetSysVariableConfRequest req)(api.get='/api/memory/sys_variable_conf', api.category="memory")
    memory.GetProjectVariableListResp GetProjectVariableList(1:memory.GetProjectVariableListReq req)(api.get='/api/memory/project/variable/meta_list', api.category="memory_project")
    memory.UpdateProjectVariableResp UpdateProjectVariable(1:memory.UpdateProjectVariableReq req)(api.post='/api/memory/project/variable/meta_update', api.category="memory_project")
    document2.GetDocumentTableInfoResponse GetDocumentTableInfo(1:document2.GetDocumentTableInfoRequest req)  (api.get='/api/memory/doc_table_info', api.category="memory", agw.preserve_base="true")

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
    // slice相关
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")
    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")
    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")
    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")

}