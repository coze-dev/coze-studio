include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct DeleteSliceRequest {
    4:  optional list<string> slice_ids (api.body="slice_ids") // 要删除的分片ID列表
    255: optional base.Base Base
}

struct DeleteSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct CreateSliceRequest {
    2: required i64 document_id(agw.js_conv="str", api.js_conv="true") // 新增分片插入的文档ID
    5: optional string raw_text  // 新增分片的内容
    6: optional i64 sequence(agw.js_conv="str", api.js_conv="true") // 分片插入位置，1表示文档开头，最大值为最后一个分片位置+1
    255: optional base.Base Base
}

struct CreateSliceResponse {
    1: i64  slice_id (agw.js_conv="str", api.js_conv="true") // 新增分片ID

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateSliceRequest {
    2: required i64 slice_id (agw.js_conv="str", api.js_conv="true") // 要更新的分片ID
    7: optional string  raw_text   // 要更新的内容
    255: optional base.Base Base
}

enum SliceStatus {
    PendingVectoring = 0 // 未向量化
    FinishVectoring  = 1 // 已向量化
    Deactive         = 9 // 禁用
}

struct UpdateSliceResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct ListSliceRequest {
    2:  optional i64    document_id(agw.js_conv="str", api.js_conv="true") // 要list的分片所属的文档ID
    3:  optional i64    sequence(agw.js_conv="str", api.js_conv="true")    // 分片序号，表示从该序号的分片开始list
    4:  optional string keyword                         // 查询关键字
    5:  optional i64    dataset_id (agw.js_conv="str", api.js_conv="true")  // 如果只传 dataset_id，则返回该知识库下的分片
    21:          i64    page_size(agw.js_conv="str", api.js_conv="true")  // 每页大小
    255: optional base.Base Base
}

struct ListSliceResponse {
    1: list<SliceInfo> slices  // 返回的分片列表
    2: i64 total(agw.js_conv="str", api.js_conv="true") // 总分片数
    3: bool hasmore // 是否还有更多分片

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct SliceInfo {
    1: i64         slice_id  (agw.js_conv="str", api.js_conv="true") // 分片ID
    2: string      content // 分片内容
    3: SliceStatus status // 分片状态
    4: i64         hit_count(agw.js_conv="str", api.js_conv="true")   // 命中次数
    5: i64         char_count(agw.js_conv="str", api.js_conv="true")  // 字符数
    7: i64         sequence(agw.js_conv="str", api.js_conv="true")    // 序号
    8: i64         document_id(agw.js_conv="str", api.js_conv="true") // 分片所属的文档ID
    9: string      chunk_info // 分片相关的元信息, 透传 slice 表里的 extra->chunk_info 字段 (json)
}