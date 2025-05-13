include "./plugin/plugin_develop.thrift"
include "./data_engine/dataset/dataset.thrift"
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

service CozeService {
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

    // slice相关
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")
    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")
    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")
    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")
}