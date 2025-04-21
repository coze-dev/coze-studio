include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct ListDocumentRequest {
    1: required i64  dataset_id(agw.js_conv='str')
    2: optional list<i64> document_ids(agw.js_conv='str')
    3: optional i32 page
    4: optional i32 size
    5: optional string keyword       // 根据名称搜索

    255: optional base.Base Base
}

struct ListDocumentResponse {
    1: list<DocumentInfo> document_infos
    2: i32                total

    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp
}

struct DocumentInfo {
    1:  string             name
    2:  i64                document_id(agw.js_conv='str', api.js_conv='true')
    3:  optional string    tos_uri         // 文件链接
    4:  optional i32       bot_used_count  // 使用的bot数量 deprecated
    5:  i32                create_time     // 创建时间
    6:  i32                update_time     // 更新时间
    7:  optional i64       creator_id (agw.js_conv="str", agw.key="creator_id")      // 创建人
    8:  i32                slice_count     // 包含分段数量
    9:  string             type            // 文件后缀 csv, pdf 等
    10: i32                size            // 文件大小 字节数
    11: i32                char_count      // 字符数
    12: common.DocumentStatus status       // 状态
    13: i32                hit_count       // 命中次数
    14: common.DocumentSource     source_type     // 来源
    15: common.UpdateType  update_type     // 更新类型
    16: i32                update_interval // 更新间隔

    18: common.FormatType  format_type     // 文件类型

    19: optional list<TableColumn>  table_meta   // 表格类型元数据
    20: optional string    web_url         // url 地址
    21: optional string    status_descript // 状态的详细信息；如果切片失败，返回失败信息
    22: optional i64       source_file_id(agw.js_conv="str", agw.key="source_file_id")
    23: optional bool      is_disconnect
    24: optional i64       space_id(agw.js_conv="str")

    // 以下字段仅针对重构后的表格类型有用，用于前端判断
    25: optional bool  editable_update_rule     // 仅针对表格类型，是否允许编辑更新频率
    26: optional bool  editable_append_content  // 仅针对表格类型，是否允许添加内容、修改表结构
    27: common.ChunkStrategy  chunk_strategy           // 切片规则

    28: optional string     imagex_uri      // imagex 存储的文件链接
    29: optional string     doc_outline     // 层级分段文档树Json (未使用)
    30: optional common.ParsingStrategy     parsing_strategy // 解析策略
    31: optional common.IndexStrategy       index_strategy;
    32: optional common.FilterStrategy      filter_strategy;
    33: optional string     doc_tree_tos_url // 层级分段文档树 tos_url
    34: optional string     preview_tos_url  // 预览用的原文档 tos_url
    35: optional i64        review_id  // 预览用的原文档 tos_url
}

struct TableColumn {
    1: i64      id(agw.js_conv="str", agw.key="id")            // 列 id
    2: string   column_name                                    // 列名
    3: bool     is_semantic   // 是否为语义匹配列
    4: i64      sequence(agw.js_conv="str", agw.key="sequence")// 列原本在 excel 的序号
    5: optional ColumnType column_type // 列类型
    6: optional bool contains_empty_value
    7: optional string   desc          // 描述
}


enum ColumnType {
    Unknown = 0
    Text    = 1                 // 文本
    Number  = 2                 // 数字
    Date    = 3                 // 时间
    Float   = 4                 // float
    Boolean = 5                 // bool
    Image   = 6                 // 图片
}

struct DeleteDocumentRequest {
    2: list<i64> document_ids(agw.js_conv="str")

    255: optional base.Base Base
}

struct DeleteDocumentResponse {
    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp
}

struct UpdateDocumentRequest{
    1: i64                 document_id (agw.js_conv="str")
    2: optional common.DocumentStatus status    // 重构后文档没有启用状态，给老接口使用

    // 需要更新就传, 更新名称
    3: optional string     document_name

    // web 类型
    4: optional UpdateRule update_rule            // web 类型更新配置

    // 更新表结构
    5: optional list<TableColumn> table_meta      // 表格元数据

    255: optional base.Base Base
}

struct UpdateDocumentResponse {
    1: optional DocumentInfo document_info   // deprecated 兼容老接口，更新内容时会返回。
    253: optional i64 code
    254: optional string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateRule {
    1: common.UpdateType update_type     // 更新类型
    2: i32 update_interval                        // 更新间隔，单位(天)
}

struct UpdatePhotoCaptionRequest {
    1: required i64 document_id(agw.js_conv='str')
    2: required string caption  // 描述信息

    255: optional base.Base Base
}

struct UpdatePhotoCaptionResponse {
    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct ListPhotoRequest {
    1: required i64  dataset_id(agw.js_conv='str')
    2: optional i32 page // 页数，从 1 开始
    3: optional i32 size
    4: optional PhotoFilter filter

    255: optional base.Base Base
}

struct PhotoFilter {
    1: optional bool has_caption // true 筛选 “已标注” 的图片，false 筛选 “未标注” 的图片
    2: optional string keyword // 搜索关键字，对图片名称和图片描述进行搜索
    3: optional common.DocumentStatus status // 状态
}

struct ListPhotoResponse {
    1: list<PhotoInfo> photo_infos
    2: i32             total

    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct PhotoInfo {
    1:  string             name
    2:  i64                document_id(agw.js_conv='str', api.js_conv='true')
    3:  string             url             // 图片链接
    4:  string             caption         // 图片描述信息
    5:  i32                create_time     // 创建时间
    6:  i32                update_time     // 更新时间
    7:  i64                creator_id (agw.js_conv="str", api.js_conv='true', agw.key="creator_id")      // 创建人
    8:  string             type            // 图片后缀 jpg, png 等
    9: i32                size            // 图片大小
    10: common.DocumentStatus status       // 状态
    11: common.DocumentSource source_type     // 来源
}

struct PhotoDetailRequest {
    1: required list<i64>  document_ids(agw.js_conv='str')
    2: required i64        dataset_id(agw.js_conv='str')
    255: optional base.Base Base
}

struct PhotoDetailResponse {
    1: map<i64, PhotoInfo> photo_infos(agw.js_conv='str', api.js_conv='true')
    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct ResegmentRequest {
    1: i64 dataset_id (agw.js_conv="str")
    2: list<i64> document_ids (agw.js_conv="str") // 要重新分段的接口
    3: common.ChunkStrategy   chunk_strategy             // 分段策略
    4: optional list<i64> review_ids (agw.js_conv="str") // 预切片的审阅ID列表
    5: optional common.ParsingStrategy     parsing_strategy // 解析策略
    6: optional common.IndexStrategy       index_strategy;
    7: optional common.FilterStrategy      filter_strategy;

    255: optional base.Base Base
}

struct ResegmentResponse {
    1: list<DocumentInfo> document_infos  // 老版需要. 仅返回id 和名称即可

    253: optional i64 code
    254: optional string msg
    255: optional base.BaseResp BaseResp
}

struct CreateDocumentRequest {
    1:  i64                       dataset_id(agw.js_conv='str')

    4:  common.FormatType         format_type

    // 表格类型一次只能创建一个
    6:  list<DocumentBase>        document_bases      // 待创建的文档信息

    17: optional common.ChunkStrategy chunk_strategy  // 只在知识库中没有文档时需要传递，已有则从知识库获取.切片规则，为空则自动按段落切片，具体规则见IDP：https://bytedance.larkoffice.com/docx/Ro4tdG64VoogMlxWqgyc2lsjncf
    18: optional common.SinkStrategy sink_strategy // 数据导入的时候落库规则
    // 是否为追加内容，用于表格添加内容
    31: optional bool is_append               // 为 true 时向已有的 document 追加内容。text 类型不能使用
    32: optional common.ParsingStrategy     parsing_strategy // 解析策略
    33: optional common.IndexStrategy       index_strategy
    34: optional common.StorageStrategy     storage_strategy

    255: optional base.Base Base
}

struct CreateDocumentResponse {
    2: list<DocumentInfo> document_infos

    253: optional i32 code
    254: optional string msg
    255: required base.BaseResp BaseResp
}

// 用于创建文档的基本信息
struct DocumentBase{
    1: string name
    2: SourceInfo source_info
    3: optional UpdateRule update_rule   // api 类型更新配置, 其他类型不需要传
     // 以下参数表格类型需要传递
    4: optional list<TableColumn> table_meta          // 表格元数据
    5: optional TableSheet        table_sheet         // 表格解析信息
    6: optional common.FilterStrategy      filter_strategy  // 过滤策略
    7: optional string caption                              // 图片类型，人工标注时的图片描述，目前只支持openapi调用
}

// 支持多种数据源
struct SourceInfo {
    // document_source 本地、飞书: 文件上传的 tos 地址
    1: optional string tos_uri (agw.key="tos_uri");
    // document_source weburl, 传通过 knowledge 创建的 web_id
    2: optional i64 web_id (agw.js_conv="str", agw.key="web_id");
    // document_source google, notion: 三方源文件 id
    // document_source openapi: openapi上传的文件 id
    3: optional i64 source_file_id (agw.js_conv="str", agw.key="source_file_id");

    4: optional common.DocumentSource document_source (agw.key="document_source");
    // document_source 自定义原始内容: json list<map<string, string>>
    5: optional string custom_content (agw.key="custom_content")
    // document_source 前端抓取: 传递前端爬取插件获取到的内容
    6: optional CrawlContent crawl_content(agw.key="crawl_content")
    // document_source 本地: 如果不传 tos 地址, 则需要传文件 base64, 类型
    7: optional string file_base64 // 文件经过 base64 后的字符串
    8: optional string file_type // 文件类型, 比如 pdf
    // document_source weburl: 如果不传 web_id, 则需要传 weburl
    9: optional string web_url

    // imagex_uri, 和 tos_uri 二选一, imagex_uri 优先，需要通过 imagex 的方法获取数据和签发 url
    10: optional string imagex_uri

    // review_id: 经过预切片后的审阅ID，会直接取预切片的结果数据向量化，如果不传或传0，会重新切片
    11: optional i64 review_id(agw.js_conv='str')
}
struct TableSheet {
    1: i64 sheet_id        (agw.js_conv="str", agw.key="sheet_id")       , // 用户选择的 sheet id
    2: i64 header_line_idx (agw.js_conv="str", agw.key="header_line_idx"), // 用户选择的表头行数，从 0 开始编号
    3: i64 start_line_idx  (agw.js_conv="str", agw.key="start_line_idx") , // 用户选择的起始行号，从 0 开始编号
}

struct CrawlContent {
    1: string           title;                   // 标题
    2: list<string>     headers;                 // 表头
    3: list<map<string,string>> content;         // 抓取到的完整信息
    4: string url;                               // 抓取页面的 URL
    5: map<string,string> marks;                 // 抓取信息的 XPATH
    6: list<string>     tags;                    // 存储标记的类型，类型是 Array<'text' | 'image' | 'link'>，与 headers 一一对应
    7: Pagination pagination;                    // 新增分页配置
    8: optional map<string,map<string,string>> sub_marks; // 子页面抓取信息的 XPATH, key 对应于 marks 中的 key
}

struct Pagination {
    1: i32 max_row_count        (agw.js_conv="str");    // 列表类型采集的最大条数
    2: i32 type                 (agw.js_conv="str");    // 分页方式：0-不分页 1-滚动加载 2-下一页按钮
    3: string next_page_xpath;                          // 当类型为 2 时，需要存储用户标记的下一页按钮
}

struct GetDocumentProgressRequest {
    1: list<i64> document_ids (agw.js_conv="str")

    255: optional base.Base Base
}
struct GetDocumentProgressResponse {
    1: list<DocumentProgress> data

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct DocumentProgress {
    1: i64                  document_id(agw.js_conv="str", api.js_conv='true')
    2: i32                  progress
    3: common.DocumentStatus status
    4: optional string     status_descript  // 状态的详细描述；如果切片失败，返回失败信息
    5: string document_name
    6: optional i64     remaining_time
    7: optional i64     size
    8: optional string  type
    9: optional string  url
    10: optional common.UpdateType  update_type     // 更新类型
    11: optional i32                update_interval // 更新间隔
}

// 获取 database 上传的表格文件元信息
struct GetTableSchemaRequest {
   1: optional TableSheet  table_sheet;                                                         // 表格解析信息, 默认初始值0,0,1
   2: optional TableDataType table_data_type;                                          // 不传默认返回所有数据
   3: optional i64 document_id(agw.js_conv="str", agw.key="document_id");              // 兼容重构前的版本：如果需要拉取的是当前 document 的 schema 时传递该值
   4: optional SourceInfo source_file;                                                 // source file 的信息，新增 segment / 之前逻辑迁移到这里
   5: optional list<TableColumn> origin_table_meta;                                    // 表格预览前端需要传递原始的数据表结构
   6: optional list<TableColumn> preview_table_meta;                                   // 表格预览前端需要传递用户编辑之后的数据表结构

   255: optional base.Base Base
}

enum TableDataType {
    AllData     = 0     // schema sheets 和 preview data
    OnlySchema  = 1     // 只需要 schema 结构 & Sheets
    OnlyPreview = 2    // 只需要 preview data
}

struct DocTableSheet {
    1: i64 id;            // sheet 的编号
    2: string sheet_name; // sheet 名
    3: i64 total_row;     // 总行数
}

struct GetTableSchemaResponse {
    1: i32 code
    2: string msg
    3: list<DocTableSheet>   sheet_list
    4: list<TableColumn>  table_meta                                        // 选中的 sheet 的 schema, 不选择默认返回第一个 sheet
    5: list<map<i64,string>> preview_data(agw.js_conv="str", agw.key="preview_data")  // knowledge table 场景中会返回

    255: optional base.BaseResp BaseResp(api.none="true")
}

// 判断用户配置的 schema 是否和对应 document id 的一致
struct ValidateTableSchemaRequest {
    1: i64 space_id           (agw.js_conv="str", agw.key="space_id")
    2: i64 document_id        (agw.js_conv="str", agw.key="document_id")
    3: SourceInfo source_info (agw.key="source_file")               // source file 的信息
    4: TableSheet table_sheet (agw.key="table_sheet")

    255: optional base.Base Base
}

struct ValidateTableSchemaResponse {
    1: optional map<string,string> ColumnValidResult (agw.key="column_valid_result");
    // 如果失败会返回错误码
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

