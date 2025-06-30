include "./plugin/plugin_develop.thrift"
include "./flow/marketplace/flow_marketplace_product/public_api.thrift"
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
include "./conversation/conversation_service.thrift"
include "./conversation/message_service.thrift"
include "./conversation/agentrun_service.thrift"
include "./data_engine/ocean_cloud_memory/ocean_cloud_memory.thrift"
include "./resource/resource.thrift"
include "./passport/passport.thrift"
include "./bot_platform/ocean_cloud_workflow/ocean_cloud_workflow.thrift"
include "./bot_open_api/bot_open_api.thrift"

namespace go coze

service IntelligenceService extends intelligence.IntelligenceService {}
service ConversationService extends conversation_service.ConversationService {}
service MessageService extends message_service.MessageService {}
service AgentRunService extends agentrun_service.AgentRunService {}
service OpenAPIAuthService extends openapiauth_service.OpenAPIAuthService {}
service MemoryService extends ocean_cloud_memory.MemoryService {}
service PluginDevelopService extends plugin_develop.PluginDevelopService {}
service PublicProductService extends public_api.PublicProductService {}
service DeveloperApiService extends developer_api.DeveloperApiService {}
service PlaygroundService extends playground.PlaygroundService {}
service DatabaseService extends database.DatabaseService {}
service ResourceService extends resource.ResourceService {}
service PassportService extends passport.PassportService {}
service WorkflowService extends ocean_cloud_workflow.WorkflowService {}
service KnowledgeService extends flow_dataengine_dataset.DatasetService {}
service BotOpenApiService extends bot_open_api.BotOpenApiService {}