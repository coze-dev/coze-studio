include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct DeleteSliceRequest {
    4:  optional list<i64> slice_ids (agw.js_conv="str", agw.key="slice_ids")
    255: optional base.Base Base
}

struct DeleteSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct CreateSliceRequest {
//    1: optional i64  operator_id // deprecated
    2: required i64 document_id(agw.js_conv="str")
//    3: optional Source  source  // deprecated, 数据源
//    4: optional VectorRule vector_rule  // deprecated, 向量化规则, 未启用
    5: optional string raw_text
    6: optional i64 sequence(agw.js_conv="str")
    7: optional string extra
    8: optional i64 tree_node_id
    9: optional i64 front_tree_node_id
    10: optional i64 parent_tree_node_id
    255: optional base.Base Base
}

struct CreateSliceResponse {
    1: i64  slice_id(agw.js_conv="str")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateSliceRequest {
//    1: optional i64  operator_id // deprecated
    2: required i64 slice_id (agw.js_conv="str")
//    3: optional Source  source  // deprecated, 数据源
//    4: optional VectorRule vector_rule  // 向量化规则, 未启用
    5: optional i64 document_id(agw.target="ignore") // deprecated
    6: optional SliceStatus status // 更新的状态
    7: optional string  raw_text   // 要更新的内容
    8: optional string  table_unit_text   // 表格要更新的单元格内容
    255: optional base.Base Base
}

enum SliceStatus {
    PendingVectoring = 0 // 未向量化
    FinishVectoring  = 1 // 已向量化
    Deactive         = 9 // 禁用
    AuditFailed      = 1000 // 审核不通过
}

struct UpdateSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct ListSliceRequest {
//    1:  optional i64    operator_id                     // deprecated
    2:  optional i64    document_id(agw.js_conv="str")
    3:  optional i64    sequence(agw.js_conv="str")     // 序号
    4:  optional string keyword                         // 查询关键字
    5:  optional i64    dataset_id (agw.js_conv="str")  // 如果只传 dataset_id，则返回该知识库下的分片

    20:          i64    page_no(agw.js_conv="str")    // 从1开始
    21:          i64    page_size(agw.js_conv="str")
    22:          string sort_field
    23:          bool   is_asc

    255: optional base.Base Base
}

struct ListSliceResponse {
    1: list<SliceInfo> slices
    2: i64 total(agw.js_conv="str")
    3: bool hasmore

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct SliceInfo {
    1: i64         slice_id  (agw.js_conv="str")
    2: string      content
    3: SliceStatus status
    4: i64         hit_count(agw.js_conv="str")   // 命中次数
    5: i64         char_count(agw.js_conv="str")  // 字符数
    6: i64         token_count(agw.js_conv="str") // token数
    7: i64         sequence(agw.js_conv="str")    // 序号
    8: i64         document_id(agw.js_conv="str")
    9: string      chunk_info // 分片相关的元信息, 透传 slice 表里的 extra->chunk_info 字段 (json)
}