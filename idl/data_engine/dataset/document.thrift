include "../../base.thrift"
include "common.thrift"

namespace go flow.dataengine.dataset

struct ListDocumentRequest {
    1: required i64  dataset_id(agw.js_conv='str', api.js_conv='true')
    2: optional list<string> document_ids (agw.js_conv='str')
    3: optional i32 page
    4: optional i32 size
    5: optional string keyword       // Search by name

    255: optional base.Base Base
}

struct ListDocumentResponse {
    1: list<DocumentInfo> document_infos
    2: i32                total

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct DocumentInfo {
    1:  string             name
    2:  i64             document_id(agw.js_conv='str', api.js_conv='true')
    3:  optional string    tos_uri         // file link
    5:  i32                create_time     // create_time
    6:  i32                update_time     // update time
    7:  optional i64    creator_id (agw.js_conv="str", api.js_conv='true', api.body="creator_id")      // creator_id
    8:  i32                slice_count     // number of segments included
    9:  string             type            // File suffix csv, pdf, etc
    10: i32                size            // File size, number of bytes
    11: i32                char_count      // character count
    12: common.DocumentStatus status       // status
    13: i32                hit_count       // hit count
    14: common.DocumentSource     source_type     // source
    18: common.FormatType  format_type     // file type
    19: optional list<TableColumn>  table_meta   // Table type metadata
    20: optional string    web_url         // URL address
    21: optional string    status_descript // Details of the status; if the slice fails, return the failure information
    24: optional i64    space_id(agw.js_conv="str", api.js_conv="true") // Space ID

    // The following fields are only useful for the reconstructed table type and are used for front-end judgment
    26: optional bool  editable_append_content  // Only for table types, are you allowed to add content and modify the table structure?
    27: common.ChunkStrategy  chunk_strategy           // slicing rule

    28: optional string     imagex_uri      // File links stored by ImageX
    29: optional string     doc_outline     // Hierarchical Segmentation Document Tree Json (unused)
    30: optional common.ParsingStrategy     parsing_strategy // parsing strategy
    32: optional common.FilterStrategy      filter_strategy // filtering strategy
    33: optional string     doc_tree_tos_url // Hierarchical segmented document tree tos_url
    34: optional string     preview_tos_url  // Preview the original document tos_url
    35: optional i64        review_id  // Preview the original document tos_url
}

struct TableColumn {
    1: i64      id(agw.js_conv="str", api.js_conv="true", api.body="id")            // Column ID
    2: string   column_name                                    // column_name
    3: bool     is_semantic   // Is it a semantically matched column?
    4: i64      sequence(agw.js_conv="str", api.js_conv="true", api.body="sequence")// List the serial number originally in excel
    5: optional ColumnType column_type // column type
    6: optional bool contains_empty_value
    7: optional string   desc          // describe
}


enum ColumnType {
    Unknown = 0
    Text    = 1                 // Text
    Number  = 2                 // number
    Date    = 3                 // time
    Float   = 4                 // float
    Boolean = 5                 // bool
    Image   = 6                 // picture
}

struct DeleteDocumentRequest {
    2: list<string> document_ids // List of document IDs to delete

    255: optional base.Base Base
}

struct DeleteDocumentResponse {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateDocumentRequest{
    1: i64                 document_id (agw.js_conv="str", api.js_conv="true")

    // If you need to update, please upload it and update the name.
    3: optional string     document_name


    // Update table structure
    5: optional list<TableColumn> table_meta      // Table metadata

    255: optional base.Base Base
}

struct UpdateDocumentResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}


struct UpdatePhotoCaptionRequest {
    1: required i64 document_id(agw.js_conv='str', api.js_conv='true') // Document ID
    2: required string caption  // Picture description information to be updated

    255: optional base.Base Base
}

struct UpdatePhotoCaptionResponse {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct ListPhotoRequest {
    1: required i64  dataset_id(agw.js_conv='str', api.js_conv='true') // Knowledge ID
    2: optional i32 page // Number of pages, starting from 1
    3: optional i32 size // page size
    4: optional PhotoFilter filter

    255: optional base.Base Base
}

struct PhotoFilter {
    1: optional bool has_caption // True to filter "marked" images, false to filter "unmarked" images
    2: optional string keyword // Search keywords, search for image names and picture descriptions
    3: optional common.DocumentStatus status // status
}

struct ListPhotoResponse {
    1: list<PhotoInfo> photo_infos
    2: i32             total

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct PhotoInfo { // Picture Knowledge Base One picture corresponds to one document
    1:  string             name  // image name
    2:  i64                document_id(agw.js_conv='str', api.js_conv='true') // Document ID
    3:  string             url             // image link
    4:  string             caption         // picture description information
    5:  i32                create_time     // create_time
    6:  i32                update_time     // update time
    7:  i64                creator_id (agw.js_conv="str", api.js_conv='true', agw.key="creator_id", api.body="creator_id")      // creator_id
    8:  string             type            // Image suffix jpg, png, etc
    9: i32                size            // image size
    10: common.DocumentStatus status       // status
    11: common.DocumentSource source_type     // source
}

struct PhotoDetailRequest {
    1: required list<string>  document_ids (agw.js_conv='str') // Document ID List
    2: required i64        dataset_id(agw.js_conv='str', api.js_conv='true') // Knowledge ID
    255: optional base.Base Base
}

struct PhotoDetailResponse {
    1: map<string, PhotoInfo> photo_infos // Mapping document ID to image information
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct ResegmentRequest {
    1: i64 dataset_id (agw.js_conv="str", api.js_conv="true") // Knowledge ID
    2: list<string> document_ids // Document to be re-segmented
    3: common.ChunkStrategy   chunk_strategy             // segmentation strategy
    5: optional common.ParsingStrategy     parsing_strategy // parsing strategy
    7: optional common.FilterStrategy      filter_strategy; // filtering strategy
    255: optional base.Base Base
}

struct ResegmentResponse {
    1: list<DocumentInfo> document_infos  // The old version requires. Just return the id and name.

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct CreateDocumentRequest {
    1:  i64                       dataset_id(agw.js_conv='str', api.js_conv='true') // The knowledge base id of the document to insert.

    4:  common.FormatType         format_type // Types of knowledge bases, currently supporting text, tables, and images

    // Only one table type can be created at a time
    6:  list<DocumentBase>        document_bases      // Document information to be created

    17: optional common.ChunkStrategy chunk_strategy  // Only when there is no document in the knowledge base, it needs to be passed, and if there is one, it will be obtained from the knowledge base. Slicing rules, if it is empty, it will be automatically sliced by paragraph
    31: optional bool is_append               // Appends content to an existing document when true. The text type cannot be used
    32: optional common.ParsingStrategy     parsing_strategy // parsing strategy

    255: optional base.Base Base
}

struct CreateDocumentResponse {
    2: list<DocumentInfo> document_infos

    253: required i32 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

// Basic information for creating a document
struct DocumentBase{
    1: string name // Document name
    2: SourceInfo source_info
     // The following parameter table types need to be passed
    4: optional list<TableColumn> table_meta          // Table metadata
    5: optional TableSheet        table_sheet         // Table parsing information
    6: optional common.FilterStrategy      filter_strategy  // filtering strategy
    7: optional string caption                        // Image type knowledge base, picture description when manually annotated
}

// Supports multiple data sources
struct SourceInfo {
    1: optional string tos_uri (api.body="tos_uri"); // Upload the returned URI locally.

    4: optional common.DocumentSource document_source (api.body="document_source");

    // document_source custom raw content: Format required for a tabular knowledge base: json list < map < string, string > >
    5: optional string custom_content (api.body="custom_content")

    // document_source local: If you don't send the tos address, you need to send the file base64, type
    7: optional string file_base64 // File string after base64
    8: optional string file_type // File type, such as PDF

    // imagex_uri, and tos_uri choose one, imagex_uri priority, need to get data and sign url through imagex method
    10: optional string imagex_uri
}
struct TableSheet {
    1: i64 sheet_id        (agw.js_conv="str", agw.key="sheet_id", api.js_conv="true", api.body="sheet_id")       , // User selected sheet id
    2: i64 header_line_idx (agw.js_conv="str", agw.key="header_line_idx", api.js_conv="true", api.body="header_line_idx"), // The number of header rows selected by the user, numbered from 0
    3: i64 start_line_idx  (agw.js_conv="str", agw.key="start_line_idx", api.js_conv="true", api.body="start_line_idx") , // User-selected starting line number, numbered from 0
}


struct GetDocumentProgressRequest {
    1: list<string> document_ids

    255: optional base.Base Base
}
struct GetDocumentProgressResponse {
    1: list<DocumentProgress> data

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct DocumentProgress {
    1: i64               document_id(agw.js_conv="str", api.js_conv='true')
    2: i32                  progress // Knowledge Base Progress Percentage
    3: common.DocumentStatus status
    4: optional string     status_descript  // A detailed description of the status; if the slice fails, a failure message is returned
    5: string document_name
    6: optional i64     remaining_time // Remaining time in seconds
    7: optional i64     size
    8: optional string  type
    9: optional string  url
}

// Get the table file meta information uploaded by the database
struct GetTableSchemaRequest {
   1: optional TableSheet  table_sheet;                                                // Table parsing information, the default initial value is 0, 0, 1, which represents the first table, the first row of the table header, and the data row starts from the second row
   2: optional TableDataType table_data_type;                                          // All data is returned by default without passing it on.
   3: optional i64 document_id(agw.js_conv="str", agw.key="document_id", api.js_conv="true", api.body="document_id");              // Compatible with pre-refactoring versions: pass this value if you need to pull the schema of the current document
   4: optional SourceInfo source_file;                                                 // Source file information, add segment/before logic migrate here
   5: optional list<TableColumn> origin_table_meta;                                    // The table preview front end needs to pass the original data table structure
   6: optional list<TableColumn> preview_table_meta;                                   // The table preview front end needs to pass the data table structure edited by the user

   255: optional base.Base Base
}

enum TableDataType {
    AllData     = 0    // Schema sheets and preview data
    OnlySchema  = 1    // Only need schema structure & Sheets
    OnlyPreview = 2    // Just preview the data
}

struct DocTableSheet {
    1: i64 id;            // Number of sheet
    2: string sheet_name; // Sheet name
    3: i64 total_row;     // total number of rows
}

struct GetTableSchemaResponse {
    1: required i32 code
    2: required string msg
    3: list<DocTableSheet>   sheet_list
    4: list<TableColumn>  table_meta                                        // The schema of the selected sheet, not selected to return the first sheet by default
    5: list<map<string,string>> preview_data(api.body="preview_data")  // The knowledge table will return

    255: optional base.BaseResp BaseResp(api.none="true")
}

// Determine whether the schema configured by the user is consistent with the corresponding document id
struct ValidateTableSchemaRequest {
    1: i64 space_id           (agw.js_conv="str", agw.key="space_id", api.js_conv="true", api.body="space_id") // Space ID
    2: i64 document_id        (agw.js_conv="str", agw.key="document_id", api.js_conv="true", api.body="document_id") // Document ID to verify
    3: SourceInfo source_info (api.body="source_file")               // Information from the source file
    4: TableSheet table_sheet (api.body="table_sheet")               // Table parsing information, the default initial value is 0, 0, 1, which represents the first table, the first row of the table header, and the data row starts from the second row

    255: optional base.Base Base
}

struct ValidateTableSchemaResponse {
    1: optional map<string,string> ColumnValidResult (api.body="column_valid_result");
    // If it fails, an error code will be returned.
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct ExtractPhotoCaptionRequest {
    1: required i64 document_id (agw.js_conv="str", agw.key="document_id", api.js_conv="true", api.body="document_id")

    255: optional base.Base Base
}

struct ExtractPhotoCaptionResponse {
    1: string caption   // picture description
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}
