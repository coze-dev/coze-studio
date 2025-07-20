include "../../../base.thrift"
include "common.thrift"

namespace go knowledge.document

// 获取表格结构、预览数据
struct GetDocumentTableInfoRequest {
    2: optional string  tos_uri;              // 如果为第一次本地文件上传的表格，传递该值
    3: optional i64     document_id(agw.js_conv="str", api.js_conv="true", api.body="document_id");          // 如果为已有 document 的表格，传递该值
    4: i64              creator_id;           // 创建人[http接口不需要传递]
    255: optional base.Base Base
}

struct GetDocumentTableInfoResponse {
    1: i32 code
    2: string msg
    3: list<common.DocTableSheet> sheet_list
    4: map<string, list<common.DocTableColumn>>  table_meta(api.body="table_meta") // key: sheet_id -> list<common.DocTableColumn>
    5: map<string, list<map<string,string>>> preview_data(api.body="preview_data")      // key: sheet_id -> list_preview_data

    255: required base.BaseResp BaseResp(api.none="true")
}

struct GetTableSchemaInfoResponse {
    1: i32 code
    2: string msg
    3: list<common.DocTableSheet>   sheet_list
    4: list<common.DocTableColumn>  table_meta                                        // 选中的 sheet 的 schema, 不选择默认返回第一个 sheet
    5: list<map<i64,string>> preview_data(agw.js_conv="str", agw.key="preview_data")  // knowledge table 场景中会返回

    255: optional base.BaseResp BaseResp(api.none="true")
}

