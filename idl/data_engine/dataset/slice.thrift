include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct DeleteSliceRequest {
    4:  optional list<string> slice_ids (api.body="slice_ids") // List of sharding IDs to delete
    255: optional base.Base Base
}

struct DeleteSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct CreateSliceRequest {
    2: required i64 document_id(agw.js_conv="str", api.js_conv="true") // Add sharding inserted document ID
    5: optional string raw_text  // Add sharding content
    6: optional i64 sequence(agw.js_conv="str", api.js_conv="true") // Sharding insertion position, 1 indicates the beginning of the document, and the maximum value is the last sharding position + 1
    255: optional base.Base Base
}

struct CreateSliceResponse {
    1: i64  slice_id (agw.js_conv="str", api.js_conv="true") // Add sharding ID

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateSliceRequest {
    2: required i64 slice_id (agw.js_conv="str", api.js_conv="true") // The sharding ID to update
    7: optional string  raw_text   // Content to be updated
    255: optional base.Base Base
}

enum SliceStatus {
    PendingVectoring = 0 // unvectorized
    FinishVectoring  = 1 // vectorized
    Deactive         = 9 // disable
}

struct UpdateSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct ListSliceRequest {
    2:  optional i64    document_id(agw.js_conv="str", api.js_conv="true") // The document ID of the sharding to list
    3:  optional i64    sequence(agw.js_conv="str", api.js_conv="true")    // Sharding serial number, indicating that the list starts from the sharding of this serial number
    4:  optional string keyword                         // query keyword
    5:  optional i64    dataset_id (agw.js_conv="str", api.js_conv="true")  // If only dataset_id, return sharding under that knowledge base
    21:          i64    page_size(agw.js_conv="str", api.js_conv="true")  // page size
    255: optional base.Base Base
}

struct ListSliceResponse {
    1: list<SliceInfo> slices  // Returned list of shardings
    2: i64 total(agw.js_conv="str", api.js_conv="true") // Total shardings
    3: bool hasmore // Is there more sharding?

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct SliceInfo {
    1: i64         slice_id  (agw.js_conv="str", api.js_conv="true") // Sharding ID
    2: string      content // Sharding content
    3: SliceStatus status // Sharding state
    4: i64         hit_count(agw.js_conv="str", api.js_conv="true")   // hit count
    5: i64         char_count(agw.js_conv="str", api.js_conv="true")  // character count
    7: i64         sequence(agw.js_conv="str", api.js_conv="true")    // serial number
    8: i64         document_id(agw.js_conv="str", api.js_conv="true") // The document ID to which sharding belongs
    9: string      chunk_info // Meta information related to sharding, extra- > chunk_info field in the transparent slice table (json)
}