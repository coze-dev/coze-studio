include "../../base.thrift"
include "common.thrift"


namespace go flow.dataengine.dataset

struct CreateDatasetRequest  {
    1: string name                   // 知识库名称，长度不超过100个字符
    2: string description            // 知识库描述
    3: i64 space_id (agw.js_conv="str", api.js_conv="true")  // 空间ID
    4: string icon_uri                // 知识库头像URI
    5: common.FormatType format_type
    6: i64 biz_id (agw.js_conv="str", api.js_conv="true") // 开放给第三方的业务标识, coze 传 0 或者不传
    7: i64 project_id (agw.js_conv="str", api.js_conv="true") //新增project ID

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
    3: i64 project_id (agw.js_conv="str", api.js_conv="true") //新增project ID
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
    DatasetDeleted    = 2  // 软删
    DatasetForbid     = 3  // 不启用
    DatasetFailed      = 9
}


struct Dataset {
    1:  i64 dataset_id(agw.js_conv="str", api.js_conv="true")
    2:  string        name                 // 数据集名称
    3:  list<string>  file_list            // 文件列表
    4:  i64        all_file_size (agw.js_conv="str", api.js_conv="true") // 所有文件大小
    5:  i32           bot_used_count       // 使用Bot数
    6:  DatasetStatus status
    7:  list<string>  processing_file_list // 处理中的文件名称列表，兼容老逻辑
    8:  i32           update_time          // 更新时间，秒级时间戳
    9:  string        icon_url
    10: string        description
    11: string        icon_uri
    12: bool          can_edit             // 是否可以编辑
    13: i32           create_time          // 创建时间，秒级时间戳
    14: i64        creator_id  (agw.js_conv="str", api.js_conv="true")         // 创建者ID
    15: i64        space_id   (agw.js_conv="str", api.js_conv="true")          // 空间ID
    18: list<string>  failed_file_list (agw.js_conv="str") // 处理失败的文件

    19: common.FormatType  format_type
    20: i32                slice_count        // 分段数量
    21: i32                hit_count          // 命中次数
    22: i32                doc_count          // 文档数量
    23: common.ChunkStrategy  chunk_strategy  // 切片规则

    24: list<string>     processing_file_id_list  // 处理中的文件ID列表
    25: string        project_id          //新增project ID
}

struct ListDatasetRequest {
    1: optional DatasetFilter filter

    3: optional i32 page
    4: optional i32 size
    5: i64 space_id (agw.js_conv="str", api.js_conv="true")
    6: optional common.OrderField  order_field  // 排序字段
    7: optional common.OrderType   order_type   // 排序规则
    8: optional string space_auth // 如果传了指定值, 就放开校验
    9: optional i64 biz_id (agw.js_conv="str", api.js_conv="true") // 开放给第三方的业务标识
    10: optional bool need_ref_bots // 是否需要拉取引用bots的数量，会增加响应延时
    11: optional string project_id //新增project ID
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
    // 如果都设置了，And 关系
    1: optional string name              // 关键字搜索, 按照名称模糊匹配
    2: optional list<string>  dataset_ids (agw.js_conv="str") // 知识库id列表
    3: optional DatasetSource source_type   // 来源
    4: optional DatasetScopeType  scope_type   // 搜索类型
    5: optional common.FormatType format_type // 类型
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
    1: i64                 dataset_id (agw.js_conv="str", api.js_conv="true") // 知识库id
    2: string              name    // 知识库名称，不能为空
    3: string              icon_uri  // 知识库icon
    4: string              description // 知识库描述
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