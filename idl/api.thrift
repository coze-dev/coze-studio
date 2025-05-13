include "./plugin/plugin_develop.thrift"
include "./data_engine/dataset/dataset.thrift"
include "./data_engine/dataset/flow_dataengine_dataset.thrift"
include "./data_engine/dataset/document.thrift"
include "./data_engine/dataset/slice.thrift"
include "./bot_platform/ocean_cloud_workflow/workflow.thrift"
include "./bot_platform/ocean_cloud_workflow/trace.thrift"
include "./flow/devops/debugger/flow.devops.debugger.coze.thrift"
include "./intelligence/intelligence.thrift"
include "./developer/developer_api.thrift"
include "./playground/playground.thrift"
include "./data_engine/ocean_cloud_memory/table/table.thrift"
include "./memory/database.thrift"
include "./permission/openapiauth_service.thrift"
include "./developer/connector.thrift"
include "./conversation/conversation_service.thrift"
include "./conversation/message_service.thrift"
include "./conversation/agentrun_service.thrift"
include "./data_engine/ocean_cloud_memory/ocean_cloud_memory.thrift"
include "./resource/resource.thrift"
include "./passport/passport.thrift"
include "./bot_platform/ocean_cloud_workflow/ocean_cloud_workflow.thrift"

namespace go coze

service IntelligenceService extends intelligence.IntelligenceService {}
service ConversationService extends conversation_service.ConversationService {}
service MessageService extends message_service.MessageService {}
service AgentRunService extends agentrun_service.AgentRunService {}
service OpenAPIAuthService extends openapiauth_service.OpenAPIAuthService {}
service ConnectorService extends connector.ConnectorService {}
service MemoryService extends ocean_cloud_memory.MemoryService {}
service PluginDevelopService extends plugin_develop.PluginDevelopService {}
service DeveloperApiService extends developer_api.DeveloperApiService {}
service PlaygroundService extends playground.PlaygroundService {}
service DatabaseService extends database.DatabaseService {}
service ResourceService extends resource.ResourceService {}
service PassportService extends passport.PassportService {}
service WorkflowService extends ocean_cloud_workflow.WorkflowService {}
service KnowledgeService extends flow_dataengine_dataset.DatasetService {}

service CozeService {
    // 测试集 TODO 代码生成报错，后面再看
    //case manage
    //flow.devops.debugger.coze.SaveCaseDataResp SaveCaseData(1: flow.devops.debugger.coze.SaveCaseDataReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/save")
    //flow.devops.debugger.coze.DeleteCaseDataResp DeleteCaseData(1: flow.devops.debugger.coze.DeleteCaseDataReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/delete")
    //flow.devops.debugger.coze.CheckCaseDuplicateResp CheckCaseDuplicate(1: flow.devops.debugger.coze.CheckCaseDuplicateReq req) (api.post="/api/devops/debugger/v1/coze/testcase/casedata/check")
    //case schema
    //flow.devops.debugger.coze.GetSchemaByIDResp GetSchemaByID(1: flow.devops.debugger.coze.GetSchemaByIDReq req)(api.post="/api/devops/debugger/v1/coze/testcase/casedata/schema")
    /**** workflow end ****/
}