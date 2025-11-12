include "../../base.thrift"
include "common.thrift"


namespace go data.knowledge

struct CreateDatasetRequest  {
    1: string name                   // Knowledge base name, no more than 100 characters in length
    2: string description            // Knowledge Base Description
    3: i64 space_id (agw.js_conv="str", api.js_conv="true")  // Space ID
    4: string icon_uri                // Knowledge Base Avatar URI
    5: common.FormatType format_type
    6: i64 biz_id (agw.js_conv="str", api.js_conv="true") // Open to third-party business identity, coze pass 0 or no pass
    7: i64 project_id (agw.js_conv="str", api.js_conv="true") // Project ID

    255: optional base.Base Base
}

struct CreateDatasetResponse {
    1: i64 dataset_id (agw.js_conv="str", api.js_conv="true")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}
struct DatasetDetailRequest {
    1: list<string>  DatasetIDs  (agw.js_conv="str", api.body="dataset_ids")
    3: i64 project_id (agw.js_conv="str", api.js_conv="true") // project ID
    2: i64 space_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base
}

struct DatasetDetailResponse {
    1: map<string, common.Dataset>     dataset_details (agw.js_conv="str")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}


struct ListDatasetRequest {
    1: optional DatasetFilter filter

    3: optional i32 page
    4: optional i32 size
    5: i64 space_id (agw.js_conv="str", api.js_conv="true")
    6: optional common.OrderField  order_field  // sort field
    7: optional common.OrderType   order_type   // order_type
    8: optional string space_auth // If the specified value is passed, the verification is released
    9: optional i64 biz_id (agw.js_conv="str", api.js_conv="true") // Business identity open to third parties
    10: optional bool need_ref_bots // Whether the number of reference bots needs to be pulled will increase the response delay
    11: optional string project_id //project ID
    255: optional base.Base Base
}

struct ListDatasetResponse {
    1: list<common.Dataset>     dataset_list
    2: i32               total
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}
struct DatasetFilter {
    // The following conditions are related to and
    1: optional string name              // Keyword search, fuzzy match by name
    2: optional list<string>  dataset_ids (agw.js_conv="str") // Knowledge id list
    3: optional DatasetSource source_type   // source
    4: optional DatasetScopeType  scope_type   // search type
    5: optional common.FormatType format_type // type
}

enum DatasetScopeType {
    ScopeAll   = 1
    ScopeSelf  = 2
}

enum DatasetSource{
    SourceSelf    = 1
    SourceExplore = 2
}

struct DeleteDatasetRequest {
    1: i64 dataset_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base
}

struct DeleteDatasetResponse {
    253: required i64 code
    254: required string msg

    255: optional base.BaseResp BaseResp
}

struct UpdateDatasetRequest {
    1: i64                 dataset_id (agw.js_conv="str", api.js_conv="true") // Knowledge ID
    2: string              name    // Knowledge base name, cannot be empty
    3: string              icon_uri  // Knowledge base icon
    4: string              description // Knowledge Base Description
    5: optional             common.DatasetStatus status

    255: optional base.Base  Base;
}

struct UpdateDatasetResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp  BaseResp
}

struct GetIconRequest {
    1: common.FormatType format_type
}

struct Icon {
    1: string url
    2: string uri
}

struct GetIconResponse {
    1: Icon icon

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct GetModeConfigRequest {
    1: required i64       bot_id        // bot id
    2: optional i64       connector_id  // line of business id
    3: optional string    connector_uid // line of business user id

    255: optional base.Base Base
}

struct GetModeConfigResponse {
    1: i32 code
    2: string msg
    3: string mode
    4: i64    bot_id
    5: i64    max_table_num
    6: i64    max_column_num
    7: i64    max_capacity_kb
    8: i64    max_row_num

    255: optional base.BaseResp BaseResp
}



struct CreateDatasetOpenApiRequest  {
    1  :          string            name        (api.body = "name")                                           ,
    2  :          string            description (api.body = "description")                                    ,
    3  :          i64               space_id    (agw.js_conv="str", api.js_conv="true", api.body = "space_id"),
    4  :          i64               file_id        (api.js_conv="true", api.body = "file_id")                 ,
    5  :          common.FormatType format_type (api.body = "format_type")                                    ,
    6  :          i64            project_id  (api.body = "project_id", api.js_conv="true")                    , 

    255: optional base.Base         Base                                                                      ,
}

struct CreateDatasetOpenApiResponse {
    1  :          CreateDatasetOpenApiData data     (api.body = "data")   ,

    253: optional i64                      code     (api.body = "code")   ,
    254: optional string                   msg      (api.body = "msg"),
    255: required base.BaseResp            BaseResp                       ,
}

struct CreateDatasetOpenApiData {
    1: i64 dataset_id (agw.js_conv="str", api.js_conv="true", api.path = "dataset_id"),
}

struct UpdateDatasetOpenApiRequest {
    1  :          i64       dataset_id  (agw.js_conv="str", api.js_conv="true", api.path = "dataset_id"),
    2  :          string    name        (api.body = "name")                                             ,
    3  :          string    file_id     (api.body = "file_id")                                          ,
    4  :          string    description (api.body = "description")                                      ,

    255: optional base.Base Base                                                                        ,
}

struct UpdateDatasetOpenApiResponse {
    253: optional i64           code     (api.body = "code")   ,
    254: optional string        msg      (api.body = "msg"),
    255: required base.BaseResp BaseResp                       ,
}

struct DeleteDatasetOpenApiRequest {
    1  :          i64       dataset_id (agw.js_conv="str", api.js_conv="true", api.path = "dataset_id"),

    255: optional base.Base Base                                                                       ,
}

struct DeleteDatasetOpenApiResponse {
    253: optional i64           code     (api.body = "code")   ,
    254: optional string        msg      (api.body = "msg"),
    255: required base.BaseResp BaseResp                       ,
}

struct ListDatasetOpenApiRequest {
    1  : optional string            name        (api.query = "name")                                           ,
    2  : optional common.FormatType format_type (api.query = "format_type")                                    , // Type
    3  : optional i32               page_num    (api.query = "page_num")                                       ,
    4  : optional i32               page_size   (api.query = "page_size")                                      ,
    5  :          i64               space_id    (agw.js_conv="str", api.js_conv="true", api.query = "space_id"),
    6  : optional string            project_id  (api.query = "project_id")                                     , // Project ID

    255: optional base.Base         Base                                                                       ,
}

struct ListDatasetOpenApiResponse {
    1  :          ListDatasetOpenApiData data     (api.body = "data")   ,

    253: optional i64                    code     (api.body = "code")   ,
    254: optional string                 msg      (api.body = "msg"),
    255: required base.BaseResp          BaseResp                       ,
}

struct ListDatasetOpenApiData {
    1: list<common.Dataset> dataset_list (api.body = "dataset_list"),
    2: i32                   total_count  (api.body = "total_count") ,
}


struct ListPhotoOpenApiRequest {
    1  : required i64       dataset_id  (agw.js_conv='str', api.js_conv="true", api.path = "dataset_id"),
    2  : optional i32       page_num    (api.query = "page_num")                                        , // Page number, starting from 1
    3  : optional i32       page_size   (api.query = "page_size")                                       ,
    4  : optional string    keyword     (api.query = "keyword")                                         , // Search keyword, searches image names and image descriptions
    5  : optional bool      has_caption (api.query = "has_caption")                                     , // Whether there is description information

    255: optional base.Base Base                                                                        ,
}

struct ListPhotoOpenApiResponse {
    1  :          ListPhotoOpenApiData data     (api.body = "data")   ,

    253: optional i64                  code     (api.body = "code")   ,
    254: optional string               msg      (api.body = "msg"),
    255: required base.BaseResp        BaseResp                       ,
}

struct ListPhotoOpenApiData {
    1: list<common.PhotoInfo> photo_infos (api.body = "photo_infos"),
    2: i32                      total_count (api.body = "total_count"),
}

struct GetDocumentProgressOpenApiRequest {
    1  :          list<i64> document_ids (agw.js_conv="str", api.js_conv="true", api.body = "document_ids"),
    2  :          i64       dataset_id   (agw.js_conv="str", api.js_conv="true", api.path = "dataset_id")  ,

    255: optional base.Base Base                                                                           ,
}
struct GetDocumentProgressOpenApiResponse {
    1  :          GetDocumentProgressOpenApiData Data     (api.body = "data")   ,

    253: required i64                            Code     (api.body = "code")   ,
    254: required string                         msg      (api.body = "msg"),
    255: optional base.BaseResp                  BaseResp                       ,
}

struct GetDocumentProgressOpenApiData {
    1: list<common.DocumentProgress> data (api.body = "data"),
}
