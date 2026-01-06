include "./plugin/plugin_develop.thrift"
include "./marketplace/public_api.thrift"
include "./data/knowledge/knowledge_svc.thrift"
include "./app/intelligence.thrift"
include "./app/developer_api.thrift"
include "./playground/playground.thrift"
include "./data/database/database_svc.thrift"
include "./permission/openapiauth_service.thrift"
include "./conversation/conversation_service.thrift"
include "./conversation/message_service.thrift"
include "./conversation/agentrun_service.thrift"
include "./data/variable/variable_svc.thrift"
include "./resource/resource.thrift"
include "./passport/passport.thrift"
include "./workflow/workflow_svc.thrift"
include "./app/bot_open_api.thrift"
include "./upload/upload.thrift"
include "./admin/config.thrift"



namespace go coze

service IntelligenceService extends intelligence.IntelligenceService {}
service ConversationService extends conversation_service.ConversationService {}
service MessageService extends message_service.MessageService {}
service AgentRunService extends agentrun_service.AgentRunService {}
service OpenAPIAuthService extends openapiauth_service.OpenAPIAuthService {}
service MemoryService extends variable_svc.MemoryService {}
service PluginDevelopService extends plugin_develop.PluginDevelopService {}
service PublicProductService extends public_api.PublicProductService {}
service DeveloperApiService extends developer_api.DeveloperApiService {}
service PlaygroundService extends playground.PlaygroundService {}
service DatabaseService extends database_svc.DatabaseService {}
service ResourceService extends resource.ResourceService {}
service PassportService extends passport.PassportService {}
service WorkflowService extends workflow_svc.WorkflowService {}
service KnowledgeService extends knowledge_svc.DatasetService {}
service BotOpenApiService extends bot_open_api.BotOpenApiService {}
service UploadService extends upload.UploadService {}
service ConfigService extends config.ConfigService {}
