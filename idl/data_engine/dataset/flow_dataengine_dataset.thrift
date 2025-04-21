include "slice.thrift"
include "dataset.thrift"
include "document.thrift"
include "connector.thrift"
include "common.thrift"
include "url.thrift"
include "review.thrift"
include "openapi.thrift"
include "opensearch.thrift"

namespace go flow.dataengine.dataset

service DatasetService {
    /** 切片 - 通用 **/
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) // 删除切片
    (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")

    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) // 创建切片
    (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")

    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) // 修改切片
    (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")

    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) // 查询切片列表
    (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")

    /** 切片 - 非通用 **/
    slice.CreateSliceHitsResponse CreateSliceHits(1:slice.CreateSliceHitsRequest req) // 统计切片命中信息
    slice.DataMigrationResponse DataMigration(1: slice.DataMigrationRequest req)

    /** 知识库 - 通用 **/
    dataset.CreateDatasetResponse CreateDataset(1:dataset.CreateDatasetRequest req)
    (api.post='/api/knowledge/create', api.category="knowledge",agw.preserve_base="true")

    dataset.ListDatasetResponse ListDataset(1:dataset.ListDatasetRequest req)
    (api.post='/api/knowledge/list', api.category="knowledge",agw.preserve_base="true")

    dataset.DatasetDetailResponse DatasetDetail(1:dataset.DatasetDetailRequest req)
    (api.post='/api/knowledge/detail', api.category="knowledge",agw.preserve_base="true")

    dataset.GetDatasetRefBotsResponse GetDatasetRefBots(1:dataset.GetDatasetRefBotsRequest req)
    (api.post='/api/knowledge/ref_bots', api.category="knowledge",agw.preserve_base="true")

    dataset.DeleteDatasetResponse DeleteDataset(1:dataset.DeleteDatasetRequest req)
    (api.post='/api/knowledge/delete', api.category="knowledge",agw.preserve_base="true")

    dataset.UpdateDatasetResponse UpdateDataset(1:dataset.UpdateDatasetRequest req)
    (api.post='/api/knowledge/update', api.category="knowledge",agw.preserve_base="true")

    // 获取是否推荐层级分配方式，传入多个本地文件的存储tos
    dataset.GetTreeChunkRecResponse GetTreeChunkRec(1: dataset.GetTreeChunkRecRequest req)
    (api.post='/api/knowledge/get_tree_chunk_rec', api.category="knowledge",agw.preserve_base="true")

    // 复制知识库
    dataset.CopyDatasetResponse CopyDataset(1: dataset.CopyDatasetRequest req)
    // Coze Pro 复制知识库子任务
    dataset.CopyDatasetV2Response CopyDatasetV2(1:dataset.CopyDatasetV2Request req)
    // 注销的时候删除用户下的知识库
    dataset.DeleteDataSetsByCreatorIdResponse DeleteDatasetsByCreatorId(1:dataset.DeleteDatasetsByCreatorIdRequest req)
    // 为前端提供查询支持库图标
    dataset.GetIconResponse GetIcon(1:dataset.GetIconRequest req)
    (api.post='/api/knowledge/icon/get', api.category="knowledge",agw.preserve_base="true")
    // 迁移知识库
    dataset.MigrateDatasetResponse MigrateDataset(1:dataset.MigrateDatasetRequest req)
    // 空间Dataset权限转移
    dataset.TransferDatasetAuthResponse TransferDatasetAuth(1: dataset.TransferDatasetAuthRequest request)
    dataset.ScriptResponse Script(1:dataset.ScriptRequest request)
    // 回滚、存档场景，其实dataset用不到，配合着一起改造下
    dataset.BatchResourceCopyDoResponse BatchResourceCopyDo (1: dataset.BatchResourceCopyDoRequest req)
    /** 文档 - 通用 **/
    
    document.CreateDocumentResponse CreateDocument(1:document.CreateDocumentRequest req)
    (api.post='/api/knowledge/document/create', api.category="knowledge",agw.preserve_base="true")
    document.UpdateDocumentResponse UpdateDocument(1:document.UpdateDocumentRequest req)
    (api.post='/api/knowledge/document/update', api.category="knowledge",agw.preserve_base="true")
    document.ListDocumentResponse ListDocument(1:document.ListDocumentRequest req)
    (api.post='/api/knowledge/document/list', api.category="knowledge",agw.preserve_base="true")
    document.DeleteDocumentResponse DeleteDocument(1:document.DeleteDocumentRequest req)
    (api.post='/api/knowledge/document/delete', api.category="knowledge",agw.preserve_base="true")
    document.GetDocumentProgressResponse GetDocumentProgress(1:document.GetDocumentProgressRequest req)
    (api.post='/api/knowledge/document/progress/get', api.category="knowledge",agw.preserve_base="true")
    document.ResegmentResponse Resegment(1:document.ResegmentRequest req)
    (api.post='/api/knowledge/document/resegment', api.category="knowledge",agw.preserve_base="true")
    // RefreshDocument 从 source 拉取最新的内容，重新分片，生成新的 document
    document.RefreshDocumentResponse RefreshDocument(1:document.RefreshDocumentRequest req)
    (api.post='/api/knowledge/document/refresh_document', api.category="knowledge",agw.preserve_base="true")
    // 创建文档接口v2，供workflow调用
    document.CreateDocumentResponse CreateDocumentV2(1:document.CreateDocumentRequest req)
    document.ListModelResponse ListModel(1:document.ListModelRequest req)
    (api.post='/api/knowledge/document/list_model', api.category="knowledge",agw.preserve_base="true")
    // 追加频率
    document.SetAppendFrequencyResponse SetAppendFrequency(1: document.SetAppendFrequencyRequest request)
    (api.post='/api/knowledge/document/set_append_frequency', api.category="knowledge",agw.preserve_base="true")
    document.GetAppendFrequencyResponse GetAppendFrequency(1: document.GetAppendFrequencyRequest request)
    (api.post='/api/knowledge/document/get_append_frequency', api.category="knowledge",agw.preserve_base="true")

    // 火山云搜索相关接口
    opensearch.TestConnectionResponse TestConnection(1:opensearch.TestConnectionRequest req)
    (api.post='/api/knowledge/opensearch/connection', api.category="opensearch",agw.preserve_base="true")
    opensearch.GetInstancesResponse GetInstances(1:opensearch.GetInstancesRequest req)
    (api.post='/api/knowledge/opensearch/instances', api.category="opensearch",agw.preserve_base="true")
    opensearch.SetConfigResponse SetConfig(1:opensearch.SetConfigRequest req)
    (api.post='/api/knowledge/opensearch/set_config', api.category="opensearch",agw.preserve_base="true")
    opensearch.GetConfigResponse GetConfig(1:opensearch.GetConfigRequest req)
    (api.post='/api/knowledge/opensearch/get_config', api.category="opensearch",agw.preserve_base="true")
    opensearch.OpenPublicAddressResponse OpenPublicAddress(1:opensearch.OpenPublicAddressRequest req)
    (api.post='/api/knowledge/opensearch/open_public_address', api.category="opensearch",agw.preserve_base="true")

    /** 文档 - OpenAPI **/
    document.CreateDocumentResponse CreateDocumentOpenAPI(1:document.CreateDocumentRequest req)
    (api.post='/open_api/knowledge/document/create', api.category="knowledge",api.tag="openapi",  agw.preserve_base="true")
    document.UpdateDocumentResponse UpdateDocumentOpenAPI(1:document.UpdateDocumentRequest req)
    (api.post='/open_api/knowledge/document/update', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    document.ListDocumentResponse ListDocumentOpenAPI(1:document.ListDocumentRequest req)
    (api.post='/open_api/knowledge/document/list', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    document.DeleteDocumentResponse DeleteDocumentAPI(1:document.DeleteDocumentRequest req)
    (api.post='/open_api/knowledge/document/delete', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    openapi.GetDocumentProgressOpenApiResponse GetDocumentProgressOpenAPI(1:openapi.GetDocumentProgressOpenApiRequest req)
    (api.post='/v1/datasets/:dataset_id/process', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    /** 图片 - OpenAPI **/
    openapi.UpdatePhotoCaptionOpenApiResponse UpdatePhotoCaptionOpenAPI(1:openapi.UpdatePhotoCaptionOpenApiRequest req)
    (api.put='/v1/datasets/:dataset_id/images/:document_id', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    openapi.ListPhotoOpenApiResponse ListPhotoDocumentOpenAPI(1:openapi.ListPhotoOpenApiRequest req)
    (api.get='/v1/datasets/:dataset_id/images', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    /** 知识库 - OpenAPI **/
    openapi.CreateDatasetOpenApiResponse CreateDatasetOpenAPI(1:openapi.CreateDatasetOpenApiRequest req)
    (api.post='/v1/datasets', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    openapi.UpdateDatasetOpenApiResponse UpdateDatasetOpenAPI(1: openapi.UpdateDatasetOpenApiRequest req)
    (api.put='/v1/datasets/:dataset_id', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    openapi.DeleteDatasetOpenApiResponse DeleteDatasetOpenAPI(1: openapi.DeleteDatasetOpenApiRequest req)
    (api.delete='/v1/datasets/:dataset_id', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    openapi.ListDatasetOpenApiResponse ListDatasetOpenAPI(1: openapi.ListDatasetOpenApiRequest req)
    (api.get='/v1/datasets', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    /** 预留接口，create document支持form方式上传 **/
    document.CreateDocumentResponse CreatePhotoDocumentV2OpenAPI(1:openapi.CreateDocumentV2OpenAPIRequest req)
    (api.post='/v1/datasets/:dataset_id/documents_v2', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")


    /** 表格解析 **/
    document.GetTableSchemaResponse GetTableSchema(1:document.GetTableSchemaRequest req)
    (api.post='/api/knowledge/table_schema/get', api.category="knowledge",agw.preserve_base="true")
    document.ValidateTableSchemaResponse ValidateTableSchema(1:document.ValidateTableSchemaRequest req)
    (api.post='/api/knowledge/table_schema/validate', api.category="knowledge",agw.preserve_base="true")

    /** web 获取 **/
    document.SubmitWebUrlResponse SubmitWebUrl(1:document.SubmitWebUrlRequest req)
    (api.post='/api/knowledge/web_url/submit', api.category="knowledge",agw.preserve_base="true")
    document.BatchSubmitWebUrlResponse BatchSubmitWebUrl(1:document.BatchSubmitWebUrlRequest req)
    (api.post='/api/knowledge/web_url/batch_submit', api.category="knowledge",agw.preserve_base="true")
    document.GetWebInfoResponse GetWebInfo(1:document.GetWebInfoRequest req)
    (api.post='/api/knowledge/web_url/get', api.category="knowledge",agw.preserve_base="true")

    document.FetchWebUrlResponse FetchWebUrl(1:document.FetchWebUrlRequest req)
    (api.post='/api/knowledge/document/batch_fetch', api.category="knowledge",agw.preserve_base="true")
    document.BatchUpdateDocumentResponse BatchUpdateDocument(1:document.BatchUpdateDocumentRequest req)
    (api.post='/api/knowledge/document/batch_update', api.category="knowledge",agw.preserve_base="true")

    /** 线上监控无流量，后续观察后下掉 **/
    document.SubmitWebContentResponse SubmitWebContent(1:document.SubmitWebContentRequest req)
    document.DeleteWebDataResponse DeleteWebData(1:document.DeleteWebDataRequest req)

    /** for 近线 **/
    /*
        SaveSlices
          1. 先删除文档下的所有切片，再保存请求中的切片，保证事务
          2. 不对请求中的切片做 Embedding 落 Viking 库和落 ES 库的逻辑
    */
    slice.SaveSlicesOfflineResponse SaveSlicesOffline(1: slice.SaveSlicesOfflineRequest req)
    document.UpdateDocumentOfflineResponse UpdateDocumentOffline(1: document.UpdateDocumentOfflineRequest req)
    document.MGetDocumentOfflineResponse  MGetDocumentOffline(1: document.MGetDocumentOfflineRequest req)
    document.CrawlWebDocumentOfflineResponse CrawlWebDocumentOffline(1: document.CrawlWebDocumentOfflineRequest req)
    // 给定若干 imagex_uri, 代理获取 url
    url.MGetImageXURLResponse MGetImageXURLOffline(1: url.MGetImageXURLRequest req)

   /** Deprecated 兼容性使用，后续删除 **/
   slice.UpdateSliceStatusResponse UpdateSliceStatus(1:slice.UpdateSliceStatusRequest req) // 修改切片状态
   slice.GetTasksProgressResponse GetTasksProgress(1:slice.GetTasksProgressRequest req) // 统计切片进度
   slice.ListSlicesResponse ListSlices(1:slice.ListSlicesRequest req) // 查询切片列表
   /** End **/

   /** for 图片知识库 **/
   document.ListPhotoResponse ListPhoto(1:document.ListPhotoRequest req)
   (api.post='/api/knowledge/photo/list', api.category="knowledge",agw.preserve_base="true")
   document.PhotoDetailResponse PhotoDetail(1:document.PhotoDetailRequest req)
   (api.post='/api/knowledge/photo/detail', api.category="knowledge",agw.preserve_base="true")
   document.UpdatePhotoCaptionResponse UpdatePhotoCaption(1:document.UpdatePhotoCaptionRequest req)
   (api.post='/api/knowledge/photo/caption', api.category="knowledge",agw.preserve_base="true")
   document.ExtractPhotoCaptionResponse ExtractPhotoCaption(1:document.ExtractPhotoCaptionRequest req)
   (api.post='/api/knowledge/photo/extract_caption', api.category="knowledge",agw.preserve_base="true")

   /** connector相关API **/
   connector.GetFileTreeDocListResponse GetFileTreeDocList(1: connector.GetFileTreeDocListRequest request)
   (api.post='/api/knowledge/connector/file_tree_doc_list', api.category="knowledge",agw.preserve_base="true")
   connector.SearchDocumentResponse SearchDocument(1:connector.SearchDocumentRequest req)
   (api.post='/api/knowledge/connector/search_document', api.category="knowledge",agw.preserve_base="true")

   /** 资源库相关 **/
   dataset.MGetDisplayResourceInfoResponse MGetDisplayResourceInfo (1: dataset.MGetDisplayResourceInfoRequest req)
   dataset.SyncKnowledgeToResourceLibResponse SyncKnowledgeToResourceLib (1: dataset.SyncKnowledgeToResourceLibRequest req)
   dataset.MGetProjectResourceInfoResponse MGetProjectResourceInfo (1: dataset.MGetProjectResourceInfoRequest req)

    // ---复制资源公共操作---
    // 资源引用树查询：查询该资源下的完整引用树，按引用路径返回。resource只会对Workflow类型的资源进行调用，其他资源可以不实现。
   dataset.ResourceCopyRefTreeResponse ResourceCopyRefTree (1: dataset.ResourceCopyRefTreeRequest req)
   // 预校验：校验在给定场景下，是否可以进行复制或移动操作
   dataset.ResourceCopyPreCheckResponse ResourceCopyPreCheck (1: dataset.ResourceCopyPreCheckRequest req)
   // 资源复制： 实现当前被调用的资源的复制功能，以及对入参中的子资源的引用更新，（如果是移动到Library场景，还需要发布）
    dataset.ResourceCopyDoResponse ResourceCopyDo (1: dataset.ResourceCopyDoRequest req)
       // 解编辑锁：当任务发生失败rollback操作时，会调用解锁接口，对资源的编辑锁进行释放
   dataset.ResourceCopyEditUnlockResponse ResourceCopyEditUnlock (1: dataset.ResourceCopyEditUnlockRequest req)
   // 设置资源可见：将资源变为可见状态，隐藏状态时不能被前端接口读出来
   dataset.ResourceCopyVisibleResponse ResourceCopyVisible (1: dataset.ResourceCopyVisibleRequest req)
   // 修改引用：项目内，其他资源修改对本复制资源的引用。resource只会对Workflow类型的资源进行调用，其他资源可以不实现。
   dataset.ResourceCopyRefChangeResponse ResourceCopyRefChange (1: dataset.ResourceCopyRefChangeRequest req)
   // 任务后置处理：任务执行的后置处理逻辑，对于移动项目到Library功能，每个资源需要删除已复制到Library的项目内资源。
   dataset.ResourceCopyPostProcessResponse ResourceCopyPostProcess (1: dataset.ResourceCopyPostProcessRequest req)
   // ---复制---

   /** 预分片相关 **/
   review.CreateDocumentReviewResponse CreateDocumentReview(1:review.CreateDocumentReviewRequest req)
   (api.post='/api/knowledge/review/create', api.category="knowledge",agw.preserve_base="true")
   review.MGetDocumentReviewResponse MGetDocumentReview(1:review.MGetDocumentReviewRequest req)
   (api.post='/api/knowledge/review/mget', api.category="knowledge",agw.preserve_base="true")
   review.SaveDocumentReviewResponse SaveDocumentReview(1:review.SaveDocumentReviewRequest req)
   (api.post='/api/knowledge/review/save', api.category="knowledge",agw.preserve_base="true")

    /** 权限专用：资源关联查询 dataset专用 **/
   dataset.GetResourceEntityResponse GetResourceEntity(1:dataset.GetResourceEntityRequest request)
   // 批量接口
   dataset.BatchGetResourceEntityResponse BatchGetResourceEntity(1:dataset.BatchGetResourceEntityRequest request)
   // 资源owner转移
   dataset.TransferProjectResourceOwnerResponse TransferProjectResourceOwner(1: dataset.TransferProjectResourceOwnerRequest req)
   dataset.DouYinLongTermMemoryResponse DouYinLongTermMemorySwitch(1: dataset.DouYinLongTermMemoryRequest req)
   dataset.DouYinLongTermStatusResponse GetDouYinLongTermStatus(1: dataset.DouYinLongTermStatusRequest req)
   dataset.KnowledgeBenefitCheckResponse GetUserKnowledgeBenefit(1: dataset.KnowledgeBenefitCheckRequest req)
   (api.post='/api/knowledge/user/benefit', api.category="knowledge",agw.preserve_base="true")
   dataset.GetUpdateUserUsageResponse GetUpdateUserUsage(1: dataset.GetUpdateUserUsageRequest req)
}
