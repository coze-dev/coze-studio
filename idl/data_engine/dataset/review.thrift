include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct ReviewInput {
    1: string document_name
    2: string document_type
    3: string tos_uri
    4: optional i64 document_id (agw.js_conv="str",api.js_conv="true")
}

struct Review {
    1: optional i64 review_id (agw.js_conv="str",api.js_conv="true")
    2: string document_name
    3: string document_type
    4: string tos_url
    5: optional common.ReviewStatus status       // status
    6: optional string doc_tree_tos_url
    7: optional string preview_tos_url
}

struct CreateDocumentReviewRequest {
    1: i64 dataset_id (agw.js_conv="str",api.js_conv="true")
    2: list<ReviewInput> reviews
    3: optional common.ChunkStrategy chunk_strategy  
    4: optional common.ParsingStrategy parsing_strategy

    255: optional base.Base Base
}

struct CreateDocumentReviewResponse {
    1: i64 dataset_id (agw.js_conv="str",api.js_conv="true")
    2: list<Review> reviews

    253: required i64 code
    254: required string msg
    255: required base.BaseResp  BaseResp
}

struct MGetDocumentReviewRequest {
    1: i64 dataset_id (agw.js_conv="str",api.js_conv="true")
    2: list<string> review_ids (agw.js_conv="str")
    255: optional base.Base Base
}

struct MGetDocumentReviewResponse {
    1: i64 dataset_id (agw.js_conv="str",api.js_conv="true")
    2: list<Review> reviews

    253: required i64 code
    254: required string msg
    255: required base.BaseResp  BaseResp
}

struct SaveDocumentReviewRequest {
    1: i64 dataset_id (agw.js_conv="str",api.js_conv="true")
    2: i64 review_id (agw.js_conv="str",api.js_conv="true")
    3: string doc_tree_json
    255: optional base.Base Base
}

struct SaveDocumentReviewResponse {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp  BaseResp
}


