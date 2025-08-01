include "../../../base.thrift"

enum RefType {
    NoRef = 0
    Bot = 1
    ChatGroup = 2
}

struct RefInfo {
    1: RefType ref_type // reference type
    2: string ref_id // reference id
}

enum BotTableStatus {
    Online = 1 // online
    Delete = 2 // delete
}

enum FieldItemType {
    Text   = 1 // Text
    Number = 2 // number
    Date   = 3 // time
    Float   = 4 // float
    Boolean = 5 // bool
}

struct FieldItem {
    1: string        name
    2: string        desc
    3: FieldItemType type
    4: bool          must_required
    5: i64           id            // This field is only used to determine whether it is published. If it is not 0, it is published. The front end cannot modify the field type for the published field.
    6: i64           alterId       // When modifying a field (alter, publish), it is used to judge additions and deletions. 0 means new additions, and non-0 means modification or deletion.
    7: bool          is_system_field // Is it a system field?
}

enum BotTableRWMode {
    LimitedReadWrite    = 1     // single user mode
    ReadOnly            = 2     // read-only mode
    UnlimitedReadWrite  = 3     // multi-user mode
    RWModeMax           = 4     // Max boundary value
}

struct OrderBy {
    1: string field
    2: SortDirection direction
}

enum SortDirection {
    ASC = 1
    Desc = 2
}

struct Criterion{
    1: list<Condition> conditions
    2: string logic_expression
}

struct ListDatabaseRequest {
    1:   optional i64        creator_id  (api.js_conv="str") // Get a database created by a user
    2:   optional i64        project_id (api.js_conv="str") // Get the database under the project
    3:   optional i64        space_id (api.js_conv="str") //Get the visible database under space
    4:   optional i64        bot_id (api.js_conv="str")  //Filter bot_id to filter out databases that have been added to the bot
    5:   optional string     table_name // Table name, fuzzy search
    6:   required TableType  table_type // Draft database
    7:   optional list<OrderBy> order_by // sort
    8:   optional i32 offset
    9:   optional i32 limit
    10: optional Criterion filter_criterion  //filter criteria
    11: optional list<OrderBy> order_by_list   //sort condition
    255: optional base.Base  Base
}

struct DatabaseInfo {
    1:  i64             id          (api.js_conv="str", api.key="id") // online_database_info primary key id
    2:  i64             space_id    (api.js_conv="str") // ID of space
    3:  i64             project_id  (api.js_conv="str") // project id
    4:  string          datamodel_table_id    // Table ID on the datamodel side
    5:  string          icon_url    // avatar url
    6:  string          icon_uri    // avatar url
    7:  string          table_name  // table name
    8:  string          table_desc  // table description
    9:  BotTableStatus  status      // status
    10: i64             creator_id  (api.js_conv="str") // creator id
    11: i64             create_time // create_time
    12: i64             update_time // update time
    13: list<FieldItem> field_list  // Field information
    14: string          actual_table_name    // Data table actual name
    15: BotTableRWMode  rw_mode     // read and write mode
    16: bool            prompt_disabled  // Whether to support prompt calls
    17: bool            is_visible   // Is it visible?
    18: optional i64    draft_id     (api.js_conv="str")   // ID corresponding to draft state
    19: optional i64    bot_id       (api.js_conv="str", api.key="bot_id") // Related id. bot_id, the old one is available, the new one is not.
    20: optional map<string,string> extra_info // extended information
    21: optional bool   is_added_to_bot // Has it been added to the bot?
}

struct ListDatabaseResponse{
    1:   list<DatabaseInfo>  database_info_list
    2:   bool  has_more
    3:   i64   total_count

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct SingleDatabaseRequest{
    1:  i64   id         (api.js_conv="str", api.key="id") // database_info primary key id
    2:  bool  is_draft   (api.key="is_draft") //Whether the incoming data is in draft form, the default is false.
    3:  bool  need_sys_fields (api.key="need_sys_fields") //Do you need system fields?
    4:  i64   version    (api.js_conv="str") // The version number is not passed on, and the default is the latest.
    255: optional base.Base  Base
}

struct SingleDatabaseResponse{
    1:  DatabaseInfo  database_info

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct AddDatabaseRequest{
    1:  i64             creator_id  (api.js_conv="str") // creator id
    2:  i64             space_id    (api.js_conv="str") // ID of space
    3:  i64             project_id  (api.js_conv="str") // project id
    4:  string          icon_uri    // avatar url
    5:  string          table_name  // table name
    6:  string          table_desc  // table description
    7:  list<FieldItem> field_list  // Field information
    8:  BotTableRWMode  rw_mode     // Read and write mode, single user mode/multi-user mode
    9:  bool            prompt_disabled  // Whether to support prompt calls
    10:  optional map<string,string> extra_info // extended information
    255: optional base.Base  Base
}

struct UpdateDatabaseRequest{
    1:   i64             id     (api.js_conv="str", api.key="id") // database_info primary key id
    2:   string          icon_uri    // avatar url
    3:   string          table_name  // table name
    5:   string          table_desc  // table description
    6:   list<FieldItem> field_list  // Field information
    7:   BotTableRWMode  rw_mode     // Read and write mode, single user mode/multi-user mode
    8:   bool            prompt_disabled  // Whether to support prompt calls
    9:   optional map<string,string> extra_info // extended information
    255: optional base.Base  Base
}

struct DeleteDatabaseRequest{
    1:   i64     id     (api.js_conv="str", api.key="id") // database_info primary key id
    255: optional base.Base  Base
}

struct DeleteDatabaseResponse {
    1: required i64 code
    2: required string msg
    255: optional base.BaseResp BaseResp
}

struct BindDatabaseToBotRequest{
    1: i64 database_id (api.js_conv="str") // Draft data database table primary key id, note that it is draft state
    2: i64 bot_id    (api.js_conv="str") // bot_id
    255: optional base.Base Base
}

struct BindDatabaseToBotResponse{
    1: required i64 code
    2: required string msg
    255: optional base.BaseResp BaseResp
}

struct ListDatabaseRecordsRequest{
    1: required i64    database_id (api.js_conv="str") // database_id
    2: optional i64    bot_id (api.js_conv="str", api.key="bot_id") // bot id, here is to fill in this when looking for the draft state data associated with the bot
    3: optional i64    workflow_id (api.js_conv="str", api.key="workflow_id") // workflow_id,, here is to fill in this when looking up wk_flow associated draft status sheet
    4: optional bool not_filter_by_user_id                     // Is true does not filter by user_id Records
    5: optional bool not_filter_by_connector_id               // Records not filtered by ConnectorID
    6: TableType table_type    // Do you want to check the draft state or the online state?
    7: i64    limit            // Do not exceed 100, 50 is recommended.
    8: i64    offset           // Offset
    9: optional i64 project_id (api.js_conv="str") // Data is not isolated under the same project
    10: optional ComplexCondition  filter_criterion  //filter criteria
    11: optional list<OrderBy> order_by_list   //sort condition
    255: optional base.Base  Base
}
struct ListDatabaseRecordsRequestRPC{
    1: required i64    database_id (api.js_conv="str") // database_id
    2: TableType table_type    // Do you want to check the draft state or the online state?
    3: i64    limit            // Do not exceed 100, 50 is recommended.
    4: i64    offset           // Offset
    5: string user_id          // user id
    255: optional base.Base  Base
}
struct ListDatabaseRecordsResponseRPC{
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum
    4: list<FieldItem> field_list  // Field information
    255: required base.BaseResp BaseResp
}

struct ListDatabaseRecordsResponse{
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum
    4: optional list<FieldItem> field_list  // Field information

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateDatabaseRecordsRequest{
    1: required i64 database_id (api.js_conv="str") // database_id
    2: optional list<map<string,string>> record_data_add // new
    3: optional list<map<string,string>> record_data_alter // modified
    4: optional list<map<string,string>> record_data_delete // deleted
    5: optional TableType table_type    // Is the draft state or online state to be updated?
    6: optional string    ori_connector_id // The connector id needs to be inserted when updating.
    255: optional base.Base  Base
}

struct UpdateDatabaseRecordsResponse{
    1: required list<map<string,string>> data

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}
struct GetOnlineDatabaseIdRequest{
    1: required i64 id (api.js_conv="str") // The draft database_id
    255: optional base.Base  Base
}

struct GetOnlineDatabaseIdResponse{
    1: optional i64 id   (api.js_conv="str")   // Check the online id according to the id of the draft.

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}


struct BotTable {
    1:  i64             id          (api.js_conv="str", api.key="id") // Autoincrement id, table id
    2:  i64             bot_id      (api.js_conv="str", api.key="bot_id") // Related id bot_id
    3:  string          table_id    // table_id
    4:  string          table_name  // table name
    5:  string          table_desc  // table description
    6:  BotTableStatus  status      // status
    7:  i64             creator_id  // Creating the ID.
    8:  i64             create_time // create_time
    9:  i64             update_time // update time
    10: list<FieldItem> field_list  // Field information
    11: string          actual_table_name    // Data table actual name
    12: BotTableRWMode  rw_mode     // read and write mode
    13: optional map<string,string> extra_info // extended information
}

struct InsertBotTableRequest {
    1: BotTable bot_table // Save table information

    255: optional base.Base Base
}

struct InsertBotTableResponse {
    1: i64 table_id(api.js_conv="str", api.key="table_id") // table id

    255: required base.BaseResp BaseResp
}

struct AlterBotTableRequest {
    1: BotTable bot_table // Modify table information

    255: optional base.Base Base
}

struct AlterBotTableResponse {
    1: i64 table_id(api.js_conv="str", api.key="table_id") // table id

    255: required base.BaseResp BaseResp
}

struct DeleteBotTableRequest {
    1: required i64 related_id(api.js_conv="str", api.key="related_id")
    2: required i64 table_id(api.js_conv="str", api.key="table_id")
    3: optional i64 user_id

    255: optional base.Base Base
}

struct DeleteBotTableResponse {
    1: i64 table_id(api.js_conv="str", api.key="table_id") // table id

    255: required base.BaseResp BaseResp
}

struct GetBotTableRequest {
    1: optional i64       creator_id
    2: optional i64       bot_id(api.js_conv="str", api.key="bot_id")
    3: optional list<i64> table_ids(api.js_conv="str", api.key="table_ids")
    4: required TableType table_type

    255: optional base.Base Base
}

struct GetBotTableResponse {
    1: list<BotTable> BotTableList

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct CopyDatabaseRequest {
   1: required string IdempotentId    //ID generator generation
   2: required list<i64> TableIds       //Original tableId
   3: required i64 ToSpaceId
   4: required i64 ToUserId
   5: required i64 ToBotId
   6: required TableType table_type

   255: optional base.Base Base
}

struct CopyDatabaseResponse {
    1: required map<i64, i64> TableIdsMapping

    255: required base.BaseResp BaseResp
}

struct CopyDatabaseRollbackRequest {
   1: required string IdempotentId    // ID generator generation
   2: required map<i64, i64> TableIdsMapping  // Parameters returned CopyDatabaseResponse

   255: optional base.Base Base
}

struct CopyDatabaseRollbackResponce {
   1: required  bool Result

    255: required base.BaseResp BaseResp
}

struct GetNL2SQLRequest {
    1: required string    text          // Natural language description of database requests
    2: required i64       bot_id        // bot id
    3: optional i64       connector_id  // line of business id
    4: optional string    connector_uid // line of business user id
    5: required TableType table_type    // Table types, draft and online
    6: optional i64       database_id  (api.js_conv="str") // Database ID
    255: optional base.Base Base
}

struct GetNL2SQLResponse {
    1: i32 code
    2: string msg
    3: required string sql
    4: optional map<string,string> extraMap

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

struct ResetBotTableRequest {
    1: optional i64 creator_id         (api.js_conv="str", api.key="creator_id")
    2: optional i64 bot_id             (api.js_conv="str", api.key="bot_id")
    3: optional i64 table_id           (api.js_conv="str", api.key="table_id")
    4: required TableType table_type
    5: optional i64    connector_id  // line of business id
    6: optional string connector_uid // line of business user id
    7: optional i64    workflow_id (api.js_conv="str")   // Workflow ID
    8: optional i64    database_info_id (api.js_conv="str")   // user id
    9: optional i64    project_id (api.js_conv="str")   // Project ID
    255: optional base.Base Base
}

struct ResetBotTableResponse {
    253: optional i64 code
    254: optional string msg
    255: required base.BaseResp BaseResp(api.none="true")
}


/********  bot_table end     ********/

/********      Bytedoc  bot_table_info  start   ********/
struct BatchInsertBotTableInfoRequest {
    1: string                   db_name         // database name
    2: string                   collection_name // collection name
    3: list<map<string,string>> data            // save data
    4: i64                      user_id         // user id
    5: i64                      bot_id          // bot id

    255: optional base.Base Base
}

struct BatchInsertBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct UpdateBotTableInfoRequest {
    1: string                   db_name         // database name
    2: string                   collection_name // collection name
    3: list<map<string,string>> data_list       // update data
    4: i64                      user_id         // user id
    5: i64                      bot_id           // bot id

    255: optional base.Base Base
}

struct UpdateBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct DeleteBotTableInfoRequest {
    1: string       db_name         // database name
    2: string       collection_name // collection name
    3: list<string> ids             // Delete id list
    4: i64          user_id         // user id
    5: i64          bot_id          // bot id

    255: optional base.Base Base
}

struct DeleteBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct SearchBotTableInfoRequest {
    1: string key_word      // Search term, currently ignored
    2: i64    limit
    3: i64    offset
    4: string connector_uid // user id
    5: i64    connector_id
    6: i64    bot_id(api.js_conv="str", api.key="bot_id") // bot id
    7: string table_name    // Currently ignored
    8: i64    table_id(api.js_conv="str", api.key="table_id")
    9: optional RefInfo ref_info // citation information

    255: optional base.Base Base
}

struct SearchBotTableInfoResponse {
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum

    255: required base.BaseResp BaseResp
}

enum TableType {
    DraftTable  = 1 // draft
    OnlineTable = 2 // online
}

struct ExecuteSqlRequest {
    1: string    sql           // SQL that RunCommand can execute
    2: i64       bot_id        // bot id
    3: i64       connector_id  // line of business id
    4: string    connector_uid // line of business user id
    5: TableType table_type    // Table type
    6: string    wftest_id     // Workflow test run identification
    7: optional  RefInfo ref_info // citation information
    8: optional  list<SqlParamVal> SqlParams (api.key="sql_params")  // SQL params
    9: i64       database_info_id // Database info id
    10: i64      workflow_id   // workflow id
    11: i64      project_id    // Project ID
    255: optional base.Base Base
}

struct SqlParamVal {
  1: required FieldItemType ValueType      (go.tag="json:\"value_type\"")
  2: required bool ISNull           (go.tag="json:\"is_null\"")
  3: optional string Value          (go.tag="json:\"value\"")
  4: optional string Name           (go.tag="json:\"name\"")
}

struct ExecuteSqlResponse {
    1: required list<map<string,string>> data

    255: required base.BaseResp BaseResp
}

struct BotTablePublishReq {
    1: required i64    bot_id
    2: optional i64    connector_id  // line of business id
    3: optional string connector_uid // line of business user id
    255: optional base.Base Base
}

struct BotTablePublishResp {
    1: i64    status // Execution status: 0-successful execution 1-failed execution all 2-failed execution part
    2: string msg    // error message
    255: optional base.BaseResp BaseResp
}

struct NL2SQLRequest {
    1: required string    text          // Natural language description of database requests
    2: required i64       bot_id        // bot id
    3: optional i64       connector_id  // line of business id
    4: optional string    connector_uid // line of business user id
    5: required TableType table_type    // Table types, draft and online

    255: optional base.Base Base
}

struct NL2SQLResponse {
    1: required string sql
    2: optional map<string,string> extraMap

    255: optional base.BaseResp BaseResp
}

struct QueryTableByNLRequest {
    1: required string    text                          // Natural language description of database requests
    2: required i64       bot_id                        // bot id
    3: required i64       connector_id                  // line of business id
    4: required string    connector_uid                 // line of business user id
    5: required TableType table_type                    // Table types, draft and online
    6: optional string    x_aiplugin_tako_bot_history   // The chat history is passed to the nl2query service, which is parsed by nl2query
    7: optional string    x_aiplugin_bot_system_message // bot_system_message passed to the nl2query service, which is parsed by nl2query

    255: optional base.Base Base
}

struct QueryTableByNLResponse {
    1: required list<map<string,string>> data

    255: required base.BaseResp BaseResp
}

enum SceneType {
    BotPersona  = 1 // bot personality description
    ModelDesc   = 2 // Text description of the model given by the developer
}

struct RecommendDataModelRequest {
    1: required i64       bot_id       (api.js_conv="str", api.key="bot_id")
    2: required SceneType scene_type   (api.key="scene_type")
    3: optional string    text         (api.key="text")

    255: optional base.Base Base
}

struct RecommendDataModelResponse {
    1: list<BotTable> BotTableList      (api.key="bot_table_list")

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

/********     Bytedoc  bot_table_info  end  ********/

struct BatchAlterTableRequest {
    1: string params

    255: optional base.Base Base
}

struct BatchAlterTableResponse {
    1: string res

    255: required base.BaseResp BaseResp
}

struct MigrateDatabaseRequest{
    1: i64 bot_id
    2: i64 to_space_id
    255: optional base.Base  Base
}

struct MigrateDatabaseResponse{
    1: required i64 code
    2: required string msg
    255: required base.BaseResp BaseResp
}

struct MigrateOldDataRequest{
    1: TableType bot_type // Which table to migrate
    2: i64 bot_id (api.js_conv="str") // Which bot to migrate?
    3: list<i64> table_ids (api.js_conv="str") // Failed retry
    255: optional base.Base  Base
}

struct MigrateOldDataResponse{
    1: required i64 code
    2: required string msg
    255: required base.BaseResp BaseResp
}

struct MGetDisplayResourceInfoRequest {
    1 : list<i64> ResIDs,    // The maximum number of one page can be transferred, and the implementer can limit the maximum to 100.
    2 : i64 CurrentUserID,   // The current user, the implementation is used to determine the authority
    255: base.Base Base  ,
}

struct MGetDisplayResourceInfoResponse {
    1  : list<DisplayResourceInfo> ResourceList,
    255: required base.BaseResp BaseResp,
}

enum ActionKey{
    Copy    = 1,        //copy
    Delete  = 2,        //delete
    EnableSwitch = 3,   //enable/disable
    Edit = 4,   //edit
    CrossSpaceCopy = 10, // Cross-space copy
}

enum PublishStatus{
    UnPublished    = 1,        //unpublished
    Published    = 2,        //Published
}


// Library Resource Operations
struct ResourceAction{
    // An operation corresponds to a unique key, and the key is constrained by the resource side
    1 : required ActionKey Key (go.tag = "json:\"key\"", api.key = "key"),
    //ture = can operate this Action, false = grey out
    2 : required bool Enable (go.tag = "json:\"enable\"", api.key = "enable"),
}


// For display, the implementer provides display information
struct DisplayResourceInfo{
    1 : optional i64    ResID,    // Resource ID
    5 : optional string Desc,// resource description
    6 : optional string Icon,// Resource Icon, full url
    12 : optional i32   BizResStatus, // Resource status, each type of resource defines itself
    13 : optional bool  CollaborationEnable, // Whether to enable multi-person editing
    16 : optional map<string, string> BizExtend,  // Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type
    17 : optional list<ResourceAction> Actions,  // Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return;
    18 : optional bool DetailDisable,  // Whether to ban entering the details page
    19 : optional string Name // resource name
    20 : optional PublishStatus   PublishStatus, // Resource release status, 1 - unpublished, 2 - published
    21 : optional i64 EditTime,  // Last edited, unix timestamp
}
enum OperateType {
    Insert = 1
    Update = 2
    Delete = 3
    Select = 4
}
struct SelectFieldList{
    1: required list<string> FieldID
    2: required bool isDistinct
}
enum Operation {
  EQUAL = 1,          // "="
  NOT_EQUAL = 2,      // "< >" or "! ="
  GREATER_THAN = 3,   // ">"
  LESS_THAN = 4,      // "<"
  GREATER_EQUAL = 5,  // ">="
  LESS_EQUAL = 6,     // "<="
  IN = 7,             // "IN"
  NOT_IN = 8,         // "NOT IN"
  IS_NULL = 9,        // "IS NULL"
  IS_NOT_NULL = 10    // "IS NOT NULL"
  LIKE = 11,           // "LIKE" fuzzy match string
  NOT_LIKE = 12,       // "NOT LIKE" inverse fuzzy match
}

struct Condition {
  1: required string left; // Lvalue field name
  2: required Operation operation;
  3: required string right; // rvalue
}

struct ComplexCondition {
  1: optional list<Condition> conditions;
  2: optional ComplexCondition nestedConditions; // In order to expand, we don't need to
  3: required string logic; // "AND" or "OR"
}

struct UpsertValues {
    1: string field_id
    2: string field_value
}

struct Row {
    1: list<UpsertValues> values
}
struct CRUDDatabaseRequest {
    1: required i64 database_info_id // Database id
    2: i64  workflow_id   // Workflow id, wk flow latitude data isolation
    3: i64  project_id    // Project id, not isolated under the same project
    4: i64  bot_id      // bot id
    5: i64       connector_id  // line of business id
    6: string    connector_uid // line of business user id
    7: required TableType table_type    // Table type
    8: string    wftest_id     // Workflow test run identification
    9: optional  RefInfo ref_info // citation information
    10: optional  list<SqlParamVal> sql_params (api.key="sql_params")  // SQL params
    11: required OperateType operate_type // operation type
    12: optional SelectFieldList field_list // List of fields to query when selected
    13: optional list<OrderBy> order_by_list // Order by field list
    14: optional i64 limit // limit
    15: optional i64 offset // offset
    16: optional ComplexCondition condition // query condition
    17: optional list<Row> rows // Data to upsert
}

struct SourceInfo {

    // TOS address for local file upload
    1: optional string tos_uri (api.key="tos_uri");
    // imagex_uri, and tos_uri choose one, imagex_uri priority, need to get data and sign url through imagex method
    2: optional string imagex_uri
}


struct ValidateTableSchemaRequest {
    1: i64 space_id           (api.js_conv="str", api.key="space_id")
    2: i64 database_id        (api.js_conv="str", api.key="database_id")
    3: SourceInfo source_info (api.key="source_file", api.body="source_file")               // Information from the source file
    4: TableSheet table_sheet (api.key="table_sheet")
    5: TableType table_type (api.key="table_type")
    255: optional base.Base Base
}

struct TableSheet {
    1: i64 sheet_id        (api.js_conv="str", api.key="sheet_id")       , // User selected sheet id
    2: i64 header_line_idx (api.js_conv="str", api.key="header_line_idx"), // The number of header rows selected by the user, numbered from 0
    3: i64 start_line_idx  (api.js_conv="str", api.key="start_line_idx") , // User-selected starting line number, numbered from 0
}

struct ValidateTableSchemaResponse {
    1: optional map<string,string> SchemaValidResult (api.key="schema_valid_result");
    // If it fails, an error code will be returned.
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct GetTableSchemaRequest {
   1: optional TableSheet  table_sheet;                                                         // Table parsing information, default initial value 0, 0, 1
   2: optional TableDataType table_data_type;                                          // All data is returned by default without passing it on.
   3: optional i64 database_id(api.js_conv="str", api.key="database_id");              // Compatible with pre-refactoring versions: pass this value if you need to pull the schema of the current document
   4: optional SourceInfo source_file;                                                 // Source file information, add segment/before logic migrate here
   255: optional base.Base Base
}

enum TableDataType {
    AllData     = 0     // Schema sheets and preview data
    OnlySchema  = 1     // Only need schema structure & Sheets
    OnlyPreview = 2    // Just preview the data
}

struct DocTableSheet {
    1: i64 id;            // Number of sheet
    2: string sheet_name; // Sheet name
    3: i64 total_row;     // total number of rows
}

struct TableColumn {
    1: i64      id(api.js_conv="str", api.key="id")            // Column ID
    2: string   column_name                                    // column_name
    3: i64      sequence(api.js_conv="str", api.key="sequence")// List the serial number originally in excel
    4: optional ColumnType column_type // column type
    5: optional bool contains_empty_value
    6: optional string   desc          // describe
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

struct GetDatabaseFileProgressRequest {
    1: i64 database_id (api.js_conv="str")
    2: required TableType table_type    // Table type
    255: optional base.Base Base
}
struct GetDatabaseFileProgressResponse {
    1: DatabaseFileProgressData data
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct DatabaseFileProgressData {
    1: string              file_name
    2: i32                 progress
    3: optional string     status_descript  //Describe the information if there is a representative file processing failure
}

struct SubmitDatabaseInsertRequest {
    1: i64 database_id (api.js_conv="str")
    2: string file_uri
    3: TableType table_type    // Table type, do you want to insert into the draft table or the online table?
    4: optional TableSheet  table_sheet
    5: optional i64 connector_id  (api.js_conv="str") // Channel ID to write to
    255: optional base.Base Base
}

struct SubmitDatabaseInsertResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}


struct SubmitBatchInsertTaskRequest {
    1: string msg
    255: optional base.Base Base
}

struct SubmitBatchInsertTaskResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}


struct GetSpaceConnectorListRequest {
    1: required i64 SpaceId (api.js_conv="str")
    2: optional string Version // release inhouse
    3: optional i64 ConnectorID
    4: optional bool ListAll
    255: optional base.Base Base
}

struct GetSpaceConnectorListResponse {
    1: list<ConnectorInfo> ConnectorList

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct ConnectorInfo{
    1: i64 ConnectorID
    2: string ConnectorName
}

typedef  GetDatabaseFileProgressRequest GetDatabaseTemplateRequest

struct GetDatabaseTemplateResponse {
    1: string TosUrl // Download address

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateDatabaseBotSwitchRequest{
    1: required i64 bot_id (api.js_conv="str")
    2: required i64 database_id (api.js_conv="str")
    3: required bool prompt_disable // Whether to disable prompt
    255: optional base.Base Base
}

struct UpdateDatabaseBotSwitchResponse{
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}