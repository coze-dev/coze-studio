include "slice.thrift"
include "knowledge.thrift"
include "document.thrift"
include "common.thrift"
include "review.thrift"

namespace go data.knowledge

service DatasetService {
    // Knowledge base related
    knowledge.GetIconResponse GetIconForDataset(1:knowledge.GetIconRequest req) (api.post='/api/knowledge/icon/get', api.category="knowledge",agw.preserve_base="true")
    knowledge.CreateDatasetResponse CreateDataset(1:knowledge.CreateDatasetRequest req) (api.post='/api/knowledge/create', api.category="knowledge",agw.preserve_base="true")
    knowledge.DatasetDetailResponse DatasetDetail(1:knowledge.DatasetDetailRequest req) (api.post='/api/knowledge/detail', api.category="knowledge",agw.preserve_base="true")
    knowledge.ListDatasetResponse ListDataset(1:knowledge.ListDatasetRequest req) (api.post='/api/knowledge/list', api.category="knowledge",agw.preserve_base="true")
    knowledge.DeleteDatasetResponse DeleteDataset(1:knowledge.DeleteDatasetRequest req) (api.post='/api/knowledge/delete', api.category="knowledge",agw.preserve_base="true")
    knowledge.UpdateDatasetResponse UpdateDataset(1:knowledge.UpdateDatasetRequest req) (api.post='/api/knowledge/update', api.category="knowledge",agw.preserve_base="true")
    knowledge.GetModeConfigResponse GetModeConfig(1:knowledge.GetModeConfigRequest req)(api.get='/api/memory/table_mode_config', api.category="memory", agw.preserve_base="true")
    // Document related
    document.CreateDocumentResponse CreateDocument(1:document.CreateDocumentRequest req) (api.post='/api/knowledge/document/create', api.category="knowledge",agw.preserve_base="true")
    document.ListDocumentResponse ListDocument(1:document.ListDocumentRequest req) (api.post='/api/knowledge/document/list', api.category="knowledge",agw.preserve_base="true")
    document.DeleteDocumentResponse DeleteDocument(1:document.DeleteDocumentRequest req) (api.post='/api/knowledge/document/delete', api.category="knowledge",agw.preserve_base="true")
    document.UpdateDocumentResponse UpdateDocument(1:document.UpdateDocumentRequest req) (api.post='/api/knowledge/document/update', api.category="knowledge",agw.preserve_base="true")
    document.GetDocumentProgressResponse GetDocumentProgress(1:document.GetDocumentProgressRequest req) (api.post='/api/knowledge/document/progress/get', api.category="knowledge",agw.preserve_base="true")
    document.ResegmentResponse Resegment(1:document.ResegmentRequest req) (api.post='/api/knowledge/document/resegment', api.category="knowledge",agw.preserve_base="true")
    document.UpdatePhotoCaptionResponse UpdatePhotoCaption(1:document.UpdatePhotoCaptionRequest req) (api.post='/api/knowledge/photo/caption', api.category="knowledge",agw.preserve_base="true")
    document.ListPhotoResponse ListPhoto(1:document.ListPhotoRequest req) (api.post='/api/knowledge/photo/list', api.category="knowledge",agw.preserve_base="true")
    document.PhotoDetailResponse PhotoDetail(1:document.PhotoDetailRequest req) (api.post='/api/knowledge/photo/detail', api.category="knowledge",agw.preserve_base="true")
    document.ExtractPhotoCaptionResponse ExtractPhotoCaption(1:document.ExtractPhotoCaptionRequest req) (api.post='/api/knowledge/photo/extract_caption', api.category="knowledge",agw.preserve_base="true")
    document.GetTableSchemaResponse GetTableSchema(1:document.GetTableSchemaRequest req) (api.post='/api/knowledge/table_schema/get', api.category="knowledge",agw.preserve_base="true")
    document.ValidateTableSchemaResponse ValidateTableSchema(1:document.ValidateTableSchemaRequest req) (api.post='/api/knowledge/table_schema/validate', api.category="knowledge",agw.preserve_base="true")
    document.GetDocumentTableInfoResponse GetDocumentTableInfo(1:document.GetDocumentTableInfoRequest req) (api.get='/api/memory/doc_table_info', api.category="memory", agw.preserve_base="true")
    // Slice related
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")
    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")
    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")
    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")
    /** Pre-sharding related **/
    review.CreateDocumentReviewResponse CreateDocumentReview(1:review.CreateDocumentReviewRequest req) (api.post='/api/knowledge/review/create', api.category="knowledge",agw.preserve_base="true")
    review.MGetDocumentReviewResponse MGetDocumentReview(1:review.MGetDocumentReviewRequest req) (api.post='/api/knowledge/review/mget', api.category="knowledge",agw.preserve_base="true")
    review.SaveDocumentReviewResponse SaveDocumentReview(1:review.SaveDocumentReviewRequest req) (api.post='/api/knowledge/review/save', api.category="knowledge",agw.preserve_base="true")


    document.CreateDocumentResponse CreateDocumentOpenAPI(1:document.CreateDocumentRequest req)
    (api.post='/open_api/knowledge/document/create', api.category="knowledge",api.tag="openapi",  agw.preserve_base="true")
    document.UpdateDocumentResponse UpdateDocumentOpenAPI(1:document.UpdateDocumentRequest req)
    (api.post='/open_api/knowledge/document/update', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    document.ListDocumentResponse ListDocumentOpenAPI(1:document.ListDocumentRequest req)
    (api.post='/open_api/knowledge/document/list', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    knowledge.CreateDatasetOpenApiResponse CreateDatasetOpenAPI(1:knowledge.CreateDatasetOpenApiRequest req)
    (api.post='/v1/datasets', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
     knowledge.ListDatasetOpenApiResponse ListDatasetOpenAPI(1: knowledge.ListDatasetOpenApiRequest req)
    (api.get='/v1/datasets', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
     knowledge.UpdateDatasetOpenApiResponse UpdateDatasetOpenAPI(1: knowledge.UpdateDatasetOpenApiRequest req)
    (api.put='/v1/datasets/:dataset_id', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    knowledge.DeleteDatasetOpenApiResponse DeleteDatasetOpenAPI(1: knowledge.DeleteDatasetOpenApiRequest req)
    (api.delete='/v1/datasets/:dataset_id', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

    knowledge.ListPhotoOpenApiResponse ListPhotoDocumentOpenAPI(1: knowledge.ListPhotoOpenApiRequest req)
    (api.get='/v1/datasets/:dataset_id/images', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")
    knowledge.GetDocumentProgressOpenApiResponse GetDocumentProgressOpenAPI(1: knowledge.GetDocumentProgressOpenApiRequest req)
    (api.post='/v1/datasets/:dataset_id/process', api.category="knowledge", api.tag="openapi", agw.preserve_base="true")

}
