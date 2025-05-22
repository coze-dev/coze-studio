include "../../../base.thrift"

enum RefType {
    NoRef = 0
    Bot = 1
    ChatGroup = 2
}

struct RefInfo {
    1: RefType ref_type // 引用类型
    2: string ref_id // 引用 id
}

enum BotTableStatus {
    Online = 1 // 已上线
    Delete = 2 // 删除
}

enum FieldItemType {
    Text   = 1 // 文本
    Number = 2 // 数字
    Date   = 3 // 时间
    Float   = 4 // float
    Boolean = 5 // bool
}

struct FieldItem {
    1: string        name
    2: string        desc
    3: FieldItemType type
    4: bool          must_required
    5: i64           id            // 该字段只用来判断是否发布，不为 0 就是已发布的，前端对已发布的字段不能修改字段类型
    6: i64           alterId       // 修改字段时（alter、publish）用来判断增删改，0 表示新增，非 0 表示修改或删除
    7: bool          is_system_field // 是否是系统字段
}

enum BotTableRWMode {
    LimitedReadWrite    = 1     // 单用户模式
    ReadOnly            = 2     // 只读模式
    UnlimitedReadWrite  = 3     // 多用户模式
    RWModeMax           = 4     // Max 边界值
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
    1:   optional i64        creator_id  (api.js_conv="str") // 获取创建者为某个用户的的数据库
    2:   optional i64        project_id (api.js_conv="str") // 获取project下的数据库
    3:   optional i64        space_id (api.js_conv="str") //获取空间下的可见数据库
    4:   optional i64        bot_id (api.js_conv="str")  //对bot_id进行过滤，过滤掉已经添加到bot中的database
    5:   optional string     table_name // 表格名称，模糊搜索
    6:   required TableType  table_type // 查草稿态database
    7:   optional list<OrderBy> order_by // 排序
    8:   optional i32 offset
    9:   optional i32 limit
    10: optional Criterion filter_criterion  //筛选条件
    11: optional list<OrderBy> order_by_list   //排序条件
    255: optional base.Base  Base
}

struct DatabaseInfo {
    1:  i64             id          (api.js_conv="str", api.key="id") // online_database_info的主键id
    2:  i64             space_id    (api.js_conv="str") // 空间的id
    3:  i64             project_id  (api.js_conv="str") // project id
    4:  string          datamodel_table_id    // datamodel侧的表id
    5:  string          icon_url    // 头像url
    6:  string          icon_uri    // 头像url
    7:  string          table_name  // 表名
    8:  string          table_desc  // 表描述
    9:  BotTableStatus  status      // 状态
    10: i64             creator_id  (api.js_conv="str") // 创建者id
    11: i64             create_time // 创建时间
    12: i64             update_time // 更新时间
    13: list<FieldItem> field_list  // 字段信息
    14: string          actual_table_name    // 数据表实际名称
    15: BotTableRWMode  rw_mode     // 读写模式
    16: bool            prompt_disabled  // 是否支持prompt调用
    17: bool            is_visible   // 是否可见
    18: optional i64    draft_id     (api.js_conv="str")   // 对应草稿态的id
    19: optional i64    bot_id       (api.js_conv="str", api.key="bot_id") // 相关id. bot_id，老的有，新的没有
    20: optional map<string,string> extra_info // 扩展信息
    21: optional bool   is_added_to_bot // 是否已经添加到bot中
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
    1:  i64   id         (api.js_conv="str", api.key="id") // database_info的主键id
    2:  bool  is_draft   (api.key="is_draft") //传入的是否是草稿态数据，默认是false
    3:  bool  need_sys_fields (api.key="need_sys_fields") //是否需要系统字段
    4:  i64   version    (api.js_conv="str") // 版本号，不传默认是最新的
    255: optional base.Base  Base
}

struct SingleDatabaseResponse{
    1:  DatabaseInfo  database_info

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct AddDatabaseRequest{
    1:  i64             creator_id  (api.js_conv="str") // 创建者id
    2:  i64             space_id    (api.js_conv="str") // 空间的id
    3:  i64             project_id  (api.js_conv="str") // project id
    4:  string          icon_uri    // 头像url
    5:  string          table_name  // 表名
    6:  string          table_desc  // 表描述
    7:  list<FieldItem> field_list  // 字段信息
    8:  BotTableRWMode  rw_mode     // 读写模式，单用户模式/多用户模式
    9:  bool            prompt_disabled  // 是否支持prompt调用
    10:  optional map<string,string> extra_info // 扩展信息
    255: optional base.Base  Base
}

struct UpdateDatabaseRequest{
    1:   i64             id     (api.js_conv="str", api.key="id") // database_info的主键id
    2:   string          icon_uri    // 头像url
    3:   string          table_name  // 表名
    5:   string          table_desc  // 表描述
    6:   list<FieldItem> field_list  // 字段信息
    7:   BotTableRWMode  rw_mode     // 读写模式，单用户模式/多用户模式
    8:   bool            prompt_disabled  // 是否支持prompt调用
    9:   optional map<string,string> extra_info // 扩展信息
    255: optional base.Base  Base
}

struct DeleteDatabaseRequest{
    1:   i64     id     (api.js_conv="str", api.key="id") // database_info的主键id
    255: optional base.Base  Base
}

struct DeleteDatabaseResponse {
    1: required i64 code
    2: required string msg
    255: optional base.BaseResp BaseResp
}

struct BindDatabaseToBotRequest{
    1: i64 database_id (api.js_conv="str") // 草稿态数据database表主键id，注意是草稿态哈
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
    2: optional i64    bot_id (api.js_conv="str", api.key="bot_id") // bot id，这里是查找bot关联的草稿态数据的时候填这个
    3: optional i64    workflow_id (api.js_conv="str", api.key="workflow_id") // workflow_id，，这里是查找wk_flow关联的草稿态表的时候填这个
    4: optional bool not_filter_by_user_id                     // 为true不根据user_id进行过滤Records
    5: optional bool not_filter_by_connector_id               // 为true不根据ConnectorID进行过滤Records
    6: TableType table_type    // 要查的是草稿态还是线上态
    7: i64    limit            // 别超过100，建议50
    8: i64    offset           // 偏移量
    9: optional i64 project_id (api.js_conv="str") // 同个project下数据不隔离
    10: optional ComplexCondition  filter_criterion  //筛选条件
    11: optional list<OrderBy> order_by_list   //排序条件
    255: optional base.Base  Base
}
struct ListDatabaseRecordsRequestRPC{
    1: required i64    database_id (api.js_conv="str") // database_id
    2: TableType table_type    // 要查的是草稿态还是线上态
    3: i64    limit            // 别超过100，建议50
    4: i64    offset           // 偏移量
    5: string user_id          // 用户id
    255: optional base.Base  Base
}
struct ListDatabaseRecordsResponseRPC{
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum
    4: list<FieldItem> field_list  // 字段信息
    255: required base.BaseResp BaseResp
}

struct ListDatabaseRecordsResponse{
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum
    4: optional list<FieldItem> field_list  // 字段信息

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateDatabaseRecordsRequest{
    1: required i64 database_id (api.js_conv="str") // database_id
    2: optional list<map<string,string>> record_data_add // 新增的
    3: optional list<map<string,string>> record_data_alter // 修改的
    4: optional list<map<string,string>> record_data_delete // 删除的
    5: optional TableType table_type    // 要更新的的是草稿态还是线上态
    6: optional string    ori_connector_id // 更新时需穿入connector id
    255: optional base.Base  Base
}

struct UpdateDatabaseRecordsResponse{
    1: required list<map<string,string>> data

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}
struct GetOnlineDatabaseIdRequest{
    1: required i64 id (api.js_conv="str") // draft 的database_id
    255: optional base.Base  Base
}

struct GetOnlineDatabaseIdResponse{
    1: optional i64 id   (api.js_conv="str")   // 根据草稿的id查询线上的id

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}


struct BotTable {
    1:  i64             id          (api.js_conv="str", api.key="id") // 自增id，table id
    2:  i64             bot_id      (api.js_conv="str", api.key="bot_id") // 相关id. bot_id
    3:  string          table_id    // table_id
    4:  string          table_name  // 表名
    5:  string          table_desc  // 表描述
    6:  BotTableStatus  status      // 状态
    7:  i64             creator_id  // 创建着id
    8:  i64             create_time // 创建时间
    9:  i64             update_time // 更新时间
    10: list<FieldItem> field_list  // 字段信息
    11: string          actual_table_name    // 数据表实际名称
    12: BotTableRWMode  rw_mode     // 读写模式
    13: optional map<string,string> extra_info // 扩展信息
}

struct InsertBotTableRequest {
    1: BotTable bot_table // 保存表信息

    255: optional base.Base Base
}

struct InsertBotTableResponse {
    1: i64 table_id(api.js_conv="str", api.key="table_id") // table id

    255: required base.BaseResp BaseResp
}

struct AlterBotTableRequest {
    1: BotTable bot_table // 修改表信息

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
   1: required string IdempotentId    //ID生成器生成
   2: required list<i64> TableIds       //原来的tableId
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
   1: required string IdempotentId    // ID生成器生成
   2: required map<i64, i64> TableIdsMapping  // CopyDatabaseResponse返回的参数

   255: optional base.Base Base
}

struct CopyDatabaseRollbackResponce {
   1: required  bool Result

    255: required base.BaseResp BaseResp
}

struct GetNL2SQLRequest {
    1: required string    text          // 数据库请求的自然语言描述
    2: required i64       bot_id        // bot id
    3: optional i64       connector_id  // 业务线id
    4: optional string    connector_uid // 业务线用户id
    5: required TableType table_type    // table类型，分 draft 和 online 两种
    6: optional i64       database_id  (api.js_conv="str") // 数据库id
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
    2: optional i64       connector_id  // 业务线id
    3: optional string    connector_uid // 业务线用户id

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
    5: optional i64    connector_id  // 业务线id
    6: optional string connector_uid // 业务线用户id
    7: optional i64    workflow_id (api.js_conv="str")   // 工作流id
    8: optional i64    database_info_id (api.js_conv="str")   // 用户id
    9: optional i64    project_id (api.js_conv="str")   // 项目id
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
    1: string                   db_name         // 数据库名称
    2: string                   collection_name // 集合名
    3: list<map<string,string>> data            // 保存数据
    4: i64                      user_id         // 用户id
    5: i64                      bot_id          // bot id

    255: optional base.Base Base
}

struct BatchInsertBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct UpdateBotTableInfoRequest {
    1: string                   db_name         // 数据库名称
    2: string                   collection_name // 集合名
    3: list<map<string,string>> data_list       // 更新数据
    4: i64                      user_id         // 用户id
    5: i64                      bot_id           // bot id

    255: optional base.Base Base
}

struct UpdateBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct DeleteBotTableInfoRequest {
    1: string       db_name         // 数据库名称
    2: string       collection_name // 集合名
    3: list<string> ids             // 删除id 列表
    4: i64          user_id         // 用户id
    5: i64          bot_id          // bot id

    255: optional base.Base Base
}

struct DeleteBotTableInfoResponse {
    255: required base.BaseResp BaseResp
}

struct SearchBotTableInfoRequest {
    1: string key_word      // 搜素词,目前忽略
    2: i64    limit
    3: i64    offset
    4: string connector_uid // 用户id
    5: i64    connector_id
    6: i64    bot_id(api.js_conv="str", api.key="bot_id") // bot id
    7: string table_name    // 目前忽略
    8: i64    table_id(api.js_conv="str", api.key="table_id")
    9: optional RefInfo ref_info // 引用信息

    255: optional base.Base Base
}

struct SearchBotTableInfoResponse {
    1: required list<map<string,string>> data
    2: required bool                     HasMore=false
    3: required i32                      TotalNum

    255: required base.BaseResp BaseResp
}

enum TableType {
    DraftTable  = 1 // 草稿
    OnlineTable = 2 // 线上
}

struct ExecuteSqlRequest {
    1: string    sql           // RunCommand 能执行的sql
    2: i64       bot_id        // bot id
    3: i64       connector_id  // 业务线id
    4: string    connector_uid // 业务线用户id
    5: TableType table_type    // table类型
    6: string    wftest_id     // workflow test run 标识
    7: optional  RefInfo ref_info // 引用信息
    8: optional  list<SqlParamVal> SqlParams (api.key="sql_params")  // SQL params
    9: i64       database_info_id // database info 的id
    10: i64      workflow_id   // workflow id
    11: i64      project_id    // 项目id
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
    2: optional i64    connector_id  // 业务线id
    3: optional string connector_uid // 业务线用户id
    255: optional base.Base Base
}

struct BotTablePublishResp {
    1: i64    status // 执行状态： 0-执行成功 1-执行全部失败 2-执行部分失败
    2: string msg    // 错误信息
    255: optional base.BaseResp BaseResp
}

struct NL2SQLRequest {
    1: required string    text          // 数据库请求的自然语言描述
    2: required i64       bot_id        // bot id
    3: optional i64       connector_id  // 业务线id
    4: optional string    connector_uid // 业务线用户id
    5: required TableType table_type    // table类型，分 draft 和 online 两种

    255: optional base.Base Base
}

struct NL2SQLResponse {
    1: required string sql
    2: optional map<string,string> extraMap

    255: optional base.BaseResp BaseResp
}

struct QueryTableByNLRequest {
    1: required string    text                          // 数据库请求的自然语言描述
    2: required i64       bot_id                        // bot id
    3: required i64       connector_id                  // 业务线id
    4: required string    connector_uid                 // 业务线用户id
    5: required TableType table_type                    // table类型，分 draft 和 online 两种
    6: optional string    x_aiplugin_tako_bot_history   // chat history 透传到 nl2query 服务，由 nl2query 进行解析
    7: optional string    x_aiplugin_bot_system_message // bot_system_message 透传到 nl2query 服务，由 nl2query 进行解析

    255: optional base.Base Base
}

struct QueryTableByNLResponse {
    1: required list<map<string,string>> data

    255: required base.BaseResp BaseResp
}

enum SceneType {
    BotPersona  = 1 // bot 个性描述
    ModelDesc   = 2 // 开发者给的模型文本描述
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
    1: TableType bot_type // 迁移哪个表
    2: i64 bot_id (api.js_conv="str") // 迁移哪个bot
    3: list<i64> table_ids (api.js_conv="str") // 失败重试
    255: optional base.Base  Base
}

struct MigrateOldDataResponse{
    1: required i64 code
    2: required string msg
    255: required base.BaseResp BaseResp
}

struct MGetDisplayResourceInfoRequest {
    1 : list<i64> ResIDs,    // 最大传一页的数量，实现方可以限制最大100个
    2 : i64 CurrentUserID,   // 当前的用户，实现方用于判断权限
    255: base.Base Base  ,
}

struct MGetDisplayResourceInfoResponse {
    1  : list<DisplayResourceInfo> ResourceList,
    255: required base.BaseResp BaseResp,
}

enum ActionKey{
    Copy    = 1,        //复制
    Delete  = 2,        //删除
    EnableSwitch = 3,   //启用/禁用
    Edit = 4,   //编辑
    CrossSpaceCopy = 10, // 跨空间复制
}

enum PublishStatus{
    UnPublished    = 1,        //未发布
    Published    = 2,        //已发布
}


// Library资源操作
struct ResourceAction{
    // 一个操作对应一个唯一的key，key由资源侧约束
    1 : required ActionKey Key (go.tag = "json:\"key\"", api.key = "key"),
    //ture=可以操作该Action，false=置灰
    2 : required bool Enable (go.tag = "json:\"enable\"", api.key = "enable"),
}


// 展示用，实现方提供展示信息
struct DisplayResourceInfo{
    1 : optional i64    ResID,    // 资源id
    5 : optional string Desc,// 资源描述
    6 : optional string Icon,// 资源Icon，完整url
    12 : optional i32   BizResStatus, // 资源状态，各类型资源自身定义
    13 : optional bool  CollaborationEnable, // 是否开启多人编辑
    16 : optional map<string, string> BizExtend,  // 业务携带的扩展信息，以res_type区分，每个res_type定义的schema和含义不一样，使用前需要判断res_type
    17 : optional list<ResourceAction> Actions,  // 不同类型的不同操作按钮，由资源实现方和前端约定。返回则展示，要隐藏某个按钮，则不要返回；
    18 : optional bool DetailDisable,  // 是否禁止进详情页
    19 : optional string Name // 资源名称
    20 : optional PublishStatus   PublishStatus, // 资源发布状态，1-未发布，2-已发布
    21 : optional i64 EditTime,  // 最近编辑时间, unix秒级时间戳
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
  NOT_EQUAL = 2,      // "<>" 或 "!="
  GREATER_THAN = 3,   // ">"
  LESS_THAN = 4,      // "<"
  GREATER_EQUAL = 5,  // ">="
  LESS_EQUAL = 6,     // "<="
  IN = 7,             // "IN"
  NOT_IN = 8,         // "NOT IN"
  IS_NULL = 9,        // "IS NULL"
  IS_NOT_NULL = 10    // "IS NOT NULL"
  LIKE = 11,           // "LIKE" 模糊匹配字符串
  NOT_LIKE = 12,       // "NOT LIKE" 反向模糊匹配
}

struct Condition {
  1: required string left; // 左值填字段名
  2: required Operation operation;
  3: required string right; // 右值
}

struct ComplexCondition {
  1: optional list<Condition> conditions;
  2: optional ComplexCondition nestedConditions; // 为了拓展，先不用
  3: required string logic; // "AND" 或 "OR"
}

struct UpsertValues {
    1: string field_id
    2: string field_value
}

struct Row {
    1: list<UpsertValues> values
}
struct CRUDDatabaseRequest {
    1: required i64 database_info_id // database的id
    2: i64  workflow_id   // workflow id，wk flow纬度数据隔离
    3: i64  project_id    // 项目id，同project下不隔离
    4: i64  bot_id      // bot id
    5: i64       connector_id  // 业务线id
    6: string    connector_uid // 业务线用户id
    7: required TableType table_type    // table类型
    8: string    wftest_id     // workflow test run 标识
    9: optional  RefInfo ref_info // 引用信息
    10: optional  list<SqlParamVal> sql_params (api.key="sql_params")  // SQL params
    11: required OperateType operate_type // 操作类型
    12: optional SelectFieldList field_list // select时要查询的字段列表
    13: optional list<OrderBy> order_by_list // order by 字段列表
    14: optional i64 limit // limit
    15: optional i64 offset // offset
    16: optional ComplexCondition condition // 查询条件
    17: optional list<Row> rows // 需要upsert的数据
}

struct SourceInfo {

    // 本地文件上传的 tos 地址
    1: optional string tos_uri (api.key="tos_uri");
    // imagex_uri, 和 tos_uri 二选一, imagex_uri 优先，需要通过 imagex 的方法获取数据和签发 url
    2: optional string imagex_uri
}


struct ValidateTableSchemaRequest {
    1: i64 space_id           (api.js_conv="str", api.key="space_id")
    2: i64 database_id        (api.js_conv="str", api.key="database_id")
    3: SourceInfo source_info (api.key="source_file", api.body="source_file")               // source file 的信息
    4: TableSheet table_sheet (api.key="table_sheet")
    5: TableType table_type (api.key="table_type")
    255: optional base.Base Base
}

struct TableSheet {
    1: i64 sheet_id        (api.js_conv="str", api.key="sheet_id")       , // 用户选择的 sheet id
    2: i64 header_line_idx (api.js_conv="str", api.key="header_line_idx"), // 用户选择的表头行数，从 0 开始编号
    3: i64 start_line_idx  (api.js_conv="str", api.key="start_line_idx") , // 用户选择的起始行号，从 0 开始编号
}

struct ValidateTableSchemaResponse {
    1: optional map<string,string> SchemaValidResult (api.key="schema_valid_result");
    // 如果失败会返回错误码
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct GetTableSchemaRequest {
   1: optional TableSheet  table_sheet;                                                         // 表格解析信息, 默认初始值0,0,1
   2: optional TableDataType table_data_type;                                          // 不传默认返回所有数据
   3: optional i64 database_id(api.js_conv="str", api.key="database_id");              // 兼容重构前的版本：如果需要拉取的是当前 document 的 schema 时传递该值
   4: optional SourceInfo source_file;                                                 // source file 的信息，新增 segment / 之前逻辑迁移到这里
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

struct TableColumn {
    1: i64      id(api.js_conv="str", api.key="id")            // 列 id
    2: string   column_name                                    // 列名
    3: i64      sequence(api.js_conv="str", api.key="sequence")// 列原本在 excel 的序号
    4: optional ColumnType column_type // 列类型
    5: optional bool contains_empty_value
    6: optional string   desc          // 描述
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

struct GetDatabaseFileProgressRequest {
    1: i64 database_id (api.js_conv="str")
    2: required TableType table_type    // table类型
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
    3: optional string     status_descript  //描述信息，如果有代表文件处理失败
}

struct SubmitDatabaseInsertRequest {
    1: i64 database_id (api.js_conv="str")
    2: string file_uri
    3: TableType table_type    // table类型，要往草稿表插入还是线上表插入
    4: optional TableSheet  table_sheet
    5: optional i64 connector_id  (api.js_conv="str") // 要写入的渠道id
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
    1: string TosUrl // 下载地址

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct UpdateDatabaseBotSwitchRequest{
    1: required i64 bot_id (api.js_conv="str")
    2: required i64 database_id (api.js_conv="str")
    3: required bool prompt_disable // 是否禁用prompt
    255: optional base.Base Base
}

struct UpdateDatabaseBotSwitchResponse{
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}