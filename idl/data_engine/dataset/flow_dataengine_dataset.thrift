include "slice.thrift"
include "dataset.thrift"
include "document.thrift"
include "connector.thrift"
include "common.thrift"
include "url.thrift"
include "review.thrift"
include "openapi.thrift"

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

    // 为前端提供查询支持库图标
    dataset.GetIconResponse GetIcon(1:dataset.GetIconRequest req)
    (api.post='/api/knowledge/icon/get', api.category="knowledge",agw.preserve_base="true")

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
    document.ListModelResponse ListModel(1:document.ListModelRequest req)
    (api.post='/api/knowledge/document/list_model', api.category="knowledge",agw.preserve_base="true")

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


   /** 预分片相关 **/
   review.CreateDocumentReviewResponse CreateDocumentReview(1:review.CreateDocumentReviewRequest req)
   (api.post='/api/knowledge/review/create', api.category="knowledge",agw.preserve_base="true")
   review.MGetDocumentReviewResponse MGetDocumentReview(1:review.MGetDocumentReviewRequest req)
   (api.post='/api/knowledge/review/mget', api.category="knowledge",agw.preserve_base="true")
   review.SaveDocumentReviewResponse SaveDocumentReview(1:review.SaveDocumentReviewRequest req)
   (api.post='/api/knowledge/review/save', api.category="knowledge",agw.preserve_base="true")

   dataset.KnowledgeBenefitCheckResponse GetUserKnowledgeBenefit(1: dataset.KnowledgeBenefitCheckRequest req)
   (api.post='/api/knowledge/user/benefit', api.category="knowledge",agw.preserve_base="true")
}
