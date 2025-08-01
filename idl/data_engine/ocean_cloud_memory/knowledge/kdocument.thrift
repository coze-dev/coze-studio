include "../../../base.thrift"
include "common.thrift"

namespace go knowledge.document

// Get table structure, preview data
struct GetDocumentTableInfoRequest {
    2: optional string  tos_uri;              // If the table is uploaded for the first local file, pass the value
    3: optional i64     document_id(agw.js_conv="str", api.js_conv="true", api.body="document_id");          // If it is a document with an existing table, pass the value
    4: i64              creator_id;           // Creator [http interface does not need to be passed]
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
    4: list<common.DocTableColumn>  table_meta                                        // The schema of the selected sheet, not selected to return the first sheet by default
    5: list<map<i64,string>> preview_data(agw.js_conv="str", agw.key="preview_data")  // The knowledge table will return

    255: optional base.BaseResp BaseResp(api.none="true")
}

