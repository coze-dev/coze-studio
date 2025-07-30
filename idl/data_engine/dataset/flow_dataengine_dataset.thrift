include "slice.thrift"
include "dataset.thrift"
include "document.thrift"
include "common.thrift"
include "review.thrift"

namespace go flow.dataengine.dataset

service DatasetService {
    // Knowledge base related
    dataset.GetIconResponse GetIconForDataset(1:dataset.GetIconRequest req) (api.post='/api/knowledge/icon/get', api.category="knowledge",agw.preserve_base="true")
    dataset.CreateDatasetResponse CreateDataset(1:dataset.CreateDatasetRequest req) (api.post='/api/knowledge/create', api.category="knowledge",agw.preserve_base="true")
    dataset.DatasetDetailResponse DatasetDetail(1:dataset.DatasetDetailRequest req) (api.post='/api/knowledge/detail', api.category="knowledge",agw.preserve_base="true")
    dataset.ListDatasetResponse ListDataset(1:dataset.ListDatasetRequest req) (api.post='/api/knowledge/list', api.category="knowledge",agw.preserve_base="true")
    dataset.DeleteDatasetResponse DeleteDataset(1:dataset.DeleteDatasetRequest req) (api.post='/api/knowledge/delete', api.category="knowledge",agw.preserve_base="true")
    dataset.UpdateDatasetResponse UpdateDataset(1:dataset.UpdateDatasetRequest req) (api.post='/api/knowledge/update', api.category="knowledge",agw.preserve_base="true")
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

    // Slice related
    slice.DeleteSliceResponse DeleteSlice(1:slice.DeleteSliceRequest req) (api.post='/api/knowledge/slice/delete', api.category="knowledge",agw.preserve_base="true")
    slice.CreateSliceResponse CreateSlice(1:slice.CreateSliceRequest req) (api.post='/api/knowledge/slice/create', api.category="knowledge",agw.preserve_base="true")
    slice.UpdateSliceResponse UpdateSlice(1:slice.UpdateSliceRequest req) (api.post='/api/knowledge/slice/update', api.category="knowledge",agw.preserve_base="true")
    slice.ListSliceResponse ListSlice(1:slice.ListSliceRequest req) (api.post='/api/knowledge/slice/list', api.category="knowledge",agw.preserve_base="true")
    /** Pre-sharding related **/
    review.CreateDocumentReviewResponse CreateDocumentReview(1:review.CreateDocumentReviewRequest req) (api.post='/api/knowledge/review/create', api.category="knowledge",agw.preserve_base="true")
    review.MGetDocumentReviewResponse MGetDocumentReview(1:review.MGetDocumentReviewRequest req) (api.post='/api/knowledge/review/mget', api.category="knowledge",agw.preserve_base="true")
    review.SaveDocumentReviewResponse SaveDocumentReview(1:review.SaveDocumentReviewRequest req) (api.post='/api/knowledge/review/save', api.category="knowledge",agw.preserve_base="true")
}
