include "./prompt/prompt.thrift"
include "./agent/agent.thrift"
include "./plugin/plugin.thrift"
include "./data_engine/ocean_cloud_memory/kvmemory/kvmemory.thrift"
include "./data_engine/ocean_cloud_memory/kvmemory/project_memory.thrift"

namespace go coze

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource")

    agent.UpdateDraftBotInfoResponse UpdateDraftBotInfo(1:agent.UpdateDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot")
    agent.DraftBotCreateResponse DraftBotCreate(1:agent.DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    agent.GetDraftBotInfoResponse GetDraftBotInfo(1:agent.GetDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot")

    kvmemory.GetSysVariableConfResponse GetSysVariableConf(1:kvmemory.GetSysVariableConfRequest req)(api.get='/api/memory/sys_variable_conf', api.category="memory")
    project_memory.GetProjectVariableListResp GetProjectVariableList(1:project_memory.GetProjectVariableListReq req)(api.get='/api/memory/project/variable/meta_list', api.category="memory_project")
    project_memory.UpdateProjectVariableResp UpdateProjectVariable(1:project_memory.UpdateProjectVariableReq req)(api.post='/api/memory/project/variable/meta_update', api.category="memory_project")
    kvmemory.SetKvMemoryResp SetKvMemory(1: kvmemory.SetKvMemoryReq req)(api.post='/api/memory/variable/upsert', api.category="memory",agw.preserve_base="true")

    plugin.RegisterPluginMetaResponse RegisterPluginMeta(1: plugin.RegisterPluginMetaRequest request) (api.post = '/api/plugin_api/register_plugin_meta', api.category = "plugin")
    plugin.UpdatePluginMetaResponse UpdatePluginMeta(1: plugin.UpdatePluginMetaRequest request) (api.post = '/api/plugin_api/update_plugin_meta', api.category = "plugin")
    plugin.UpdatePluginResponse UpdatePlugin(1: plugin.UpdatePluginRequest request) (api.post = '/api/plugin_api/update', api.category = "plugin")
    plugin.DelPluginResponse DelPlugin(1: plugin.DelPluginRequest request) (api.post = '/api/plugin_api/del_plugin', api.category = "plugin", api.gen_path = 'plugin', agw.preserve_base = "true")
    plugin.GetPlaygroundPluginListResponse GetPlaygroundPluginList(1: plugin.GetPlaygroundPluginListRequest request) (api.post = '/api/plugin_api/get_playground_plugin_list' api.category = "plugin")
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
}