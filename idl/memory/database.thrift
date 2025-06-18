include "../data_engine/ocean_cloud_memory/table/table.thrift"
include "../data_engine/ocean_cloud_memory/knowledge/kdocument.thrift"

namespace go database

service DatabaseService  {
    // 根据筛选条件查询数据库列表
    table.ListDatabaseResponse ListDatabase(1: table.ListDatabaseRequest req)(api.post='/api/memory/database/list', api.category="memory",agw.preserve_base="true")
    // 根据数据库id获取某个数据库信息
    table.SingleDatabaseResponse GetDatabaseByID(1: table.SingleDatabaseRequest req)(api.post='/api/memory/database/get_by_id', api.category="memory",agw.preserve_base="true")
    // 创建一个数据库
    table.SingleDatabaseResponse AddDatabase(1: table.AddDatabaseRequest req)(api.post='/api/memory/database/add', api.category="memory",agw.preserve_base="true")
    table.SingleDatabaseResponse UpdateDatabase(1: table.UpdateDatabaseRequest req)(api.post='/api/memory/database/update', api.category="memory",agw.preserve_base="true")
    table.DeleteDatabaseResponse DeleteDatabase(1: table.DeleteDatabaseRequest req)(api.post='/api/memory/database/delete', api.category="memory",agw.preserve_base="true")
    // 将资源库的数据库添加到某个bot上（project内的数据库不可绑定）
    table.BindDatabaseToBotResponse BindDatabase(1: table.BindDatabaseToBotRequest req)(api.post='/api/memory/database/bind_to_bot', api.category="memory",agw.preserve_base="true")
    // 将资源库的数据库和某个bot解绑
    table.BindDatabaseToBotResponse UnBindDatabase(1: table.BindDatabaseToBotRequest req)(api.post='/api/memory/database/unbind_to_bot', api.category="memory",agw.preserve_base="true")
    table.ListDatabaseRecordsResponse ListDatabaseRecords(1: table.ListDatabaseRecordsRequest req)(api.post='/api/memory/database/list_records', api.category="memory",agw.preserve_base="true")
    table.UpdateDatabaseRecordsResponse UpdateDatabaseRecords(1: table.UpdateDatabaseRecordsRequest req)(api.post='/api/memory/database/update_records', api.category="memory",agw.preserve_base="true")
    // 根据数据库的draft状态的database_id获取数据库线上状态的id
    table.GetOnlineDatabaseIdResponse GetOnlineDatabaseId(1: table.GetOnlineDatabaseIdRequest req)(api.post='/api/memory/database/get_online_database_id', api.category="memory",agw.preserve_base="true")
    // 清空数据库中的所有草稿数据
    table.ResetBotTableResponse ResetBotTable(1: table.ResetBotTableRequest req)(api.post='/api/memory/database/table/reset', api.category="memory",agw.preserve_base="true")
    table.GetDatabaseTemplateResponse GetDatabaseTemplate(1:table.GetDatabaseTemplateRequest req)(api.post='/api/memory/database/get_template', api.category="memory",agw.preserve_base="true")
    table.GetSpaceConnectorListResponse GetConnectorName(1:table.GetSpaceConnectorListRequest req)(api.post='/api/memory/database/get_connector_name', api.category="memory",agw.preserve_base="true")
    table.GetBotTableResponse GetBotDatabase(1: table.GetBotTableRequest req)(api.post='/api/memory/database/table/list_new', api.category="memory",agw.preserve_base="true")
    table.UpdateDatabaseBotSwitchResponse UpdateDatabaseBotSwitch(1:table.UpdateDatabaseBotSwitchRequest req)(api.post='/api/memory/database/update_bot_switch', api.category="memory",agw.preserve_base="true")
    kdocument.GetTableSchemaInfoResponse GetDatabaseTableSchema(1:table.GetTableSchemaRequest req)(api.post='/api/memory/table_schema/get', api.category="memory",agw.preserve_base="true")
    table.ValidateTableSchemaResponse ValidateDatabaseTableSchema(1:table.ValidateTableSchemaRequest req)(api.post='/api/memory/table_schema/validate', api.category="memory",agw.preserve_base="true")
    table.SubmitDatabaseInsertResponse SubmitDatabaseInsertTask(1:table.SubmitDatabaseInsertRequest req)(api.post='/api/memory/table_file/submit', api.category="memory",agw.preserve_base="true")
    table.GetDatabaseFileProgressResponse DatabaseFileProgressData(1:table.GetDatabaseFileProgressRequest req)(api.post='/api/memory/table_file/get_progress', api.category="memory",agw.preserve_base="true")
}