include "table.thrift"
include "../knowledge/document.thrift"

namespace go data.database

service DatabaseService  {
    table.ListDatabaseResponse ListDatabase(1: table.ListDatabaseRequest req)(api.post='/api/memory/database/list', api.category="memory",agw.preserve_base="true")
    table.SingleDatabaseResponse GetDatabaseByID(1: table.SingleDatabaseRequest req)(api.post='/api/memory/database/get_by_id', api.category="memory",agw.preserve_base="true")
    table.SingleDatabaseResponse AddDatabase(1: table.AddDatabaseRequest req)(api.post='/api/memory/database/add', api.category="memory",agw.preserve_base="true")
    table.SingleDatabaseResponse UpdateDatabase(1: table.UpdateDatabaseRequest req)(api.post='/api/memory/database/update', api.category="memory",agw.preserve_base="true")
    table.DeleteDatabaseResponse DeleteDatabase(1: table.DeleteDatabaseRequest req)(api.post='/api/memory/database/delete', api.category="memory",agw.preserve_base="true")
    table.BindDatabaseToBotResponse BindDatabase(1: table.BindDatabaseToBotRequest req)(api.post='/api/memory/database/bind_to_bot', api.category="memory",agw.preserve_base="true")
    table.BindDatabaseToBotResponse UnBindDatabase(1: table.BindDatabaseToBotRequest req)(api.post='/api/memory/database/unbind_to_bot', api.category="memory",agw.preserve_base="true")
    table.ListDatabaseRecordsResponse ListDatabaseRecords(1: table.ListDatabaseRecordsRequest req)(api.post='/api/memory/database/list_records', api.category="memory",agw.preserve_base="true")
    table.UpdateDatabaseRecordsResponse UpdateDatabaseRecords(1: table.UpdateDatabaseRecordsRequest req)(api.post='/api/memory/database/update_records', api.category="memory",agw.preserve_base="true")
    table.GetOnlineDatabaseIdResponse GetOnlineDatabaseId(1: table.GetOnlineDatabaseIdRequest req)(api.post='/api/memory/database/get_online_database_id', api.category="memory",agw.preserve_base="true")
    table.ResetBotTableResponse ResetBotTable(1: table.ResetBotTableRequest req)(api.post='/api/memory/database/table/reset', api.category="memory",agw.preserve_base="true")
    table.GetDatabaseTemplateResponse GetDatabaseTemplate(1:table.GetDatabaseTemplateRequest req)(api.post='/api/memory/database/get_template', api.category="memory",agw.preserve_base="true")
    table.GetSpaceConnectorListResponse GetConnectorName(1:table.GetSpaceConnectorListRequest req)(api.post='/api/memory/database/get_connector_name', api.category="memory",agw.preserve_base="true")
    table.GetBotTableResponse GetBotDatabase(1: table.GetBotTableRequest req)(api.post='/api/memory/database/table/list_new', api.category="memory",agw.preserve_base="true")
    table.UpdateDatabaseBotSwitchResponse UpdateDatabaseBotSwitch(1:table.UpdateDatabaseBotSwitchRequest req)(api.post='/api/memory/database/update_bot_switch', api.category="memory",agw.preserve_base="true")
    document.GetTableSchemaInfoResponse GetDatabaseTableSchema(1:table.GetTableSchemaRequest req)(api.post='/api/memory/table_schema/get', api.category="memory",agw.preserve_base="true")
    table.ValidateTableSchemaResponse ValidateDatabaseTableSchema(1:table.ValidateTableSchemaRequest req)(api.post='/api/memory/table_schema/validate', api.category="memory",agw.preserve_base="true")
    table.SubmitDatabaseInsertResponse SubmitDatabaseInsertTask(1:table.SubmitDatabaseInsertRequest req)(api.post='/api/memory/table_file/submit', api.category="memory",agw.preserve_base="true")
    table.GetDatabaseFileProgressResponse DatabaseFileProgressData(1:table.GetDatabaseFileProgressRequest req)(api.post='/api/memory/table_file/get_progress', api.category="memory",agw.preserve_base="true")
}