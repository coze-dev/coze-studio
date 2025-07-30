include "../../base.thrift"
include "common.thrift"


namespace go flow.dataengine.dataset

struct CreateDatasetRequest  {
    1: string name                   // Knowledge base name, no more than 100 characters in length
    2: string description            // Knowledge Base Description
    3: i64 space_id (agw.js_conv="str", api.js_conv="true")  // Space ID
    4: string icon_uri                // Knowledge Base Avatar URI
    5: common.FormatType format_type
    6: i64 biz_id (agw.js_conv="str", api.js_conv="true") // Open to third-party business identity, coze pass 0 or no pass
    7: i64 project_id (agw.js_conv="str", api.js_conv="true") //project ID

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
    1: map<string, Dataset>     dataset_details (agw.js_conv="str")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

enum DatasetStatus {
    DatasetProcessing = 0
    DatasetReady      = 1
    DatasetDeleted    = 2  // soft delete
    DatasetForbid     = 3  // Do not enable
    DatasetFailed      = 9
}


struct Dataset {
    1:  i64 dataset_id(agw.js_conv="str", api.js_conv="true")
    2:  string        name                 // Dataset name
    3:  list<string>  file_list            // file list
    4:  i64        all_file_size (agw.js_conv="str", api.js_conv="true") // All file sizes
    5:  i32           bot_used_count       // Bot count
    6:  DatasetStatus status
    7:  list<string>  processing_file_list // List of file names in process, compatible with old logic
    8:  i32           update_time          // Update time, second timestamp
    9:  string        icon_url
    10: string        description
    11: string        icon_uri
    12: bool          can_edit             // Can it be edited?
    13: i32           create_time          // create_time, second timestamp
    14: i64        creator_id  (agw.js_conv="str", api.js_conv="true")         // creator ID
    15: i64        space_id   (agw.js_conv="str", api.js_conv="true")          // Space ID
    18: list<string>  failed_file_list (agw.js_conv="str") // Processing failed files

    19: common.FormatType  format_type
    20: i32                slice_count        // number of segments
    21: i32                hit_count          // hit count
    22: i32                doc_count          // number of documents
    23: common.ChunkStrategy  chunk_strategy  // slicing rule

    24: list<string>     processing_file_id_list  // List of file IDs in process
    25: string        project_id          //project ID
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
    1: list<Dataset>     dataset_list
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
    5: optional            DatasetStatus status

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