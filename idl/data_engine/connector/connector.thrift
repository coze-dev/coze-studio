include "../../base.thrift"

namespace go connector

enum ConnectorID {
    FeishuWeb = 103
}

typedef string FileType
    const FileType FileTypeDoc = "doc"
    const FileType FileTypeDocx = "docx"
    const FileType FileTypeSheet = "sheet"

struct FileNode {
    1: string FileID  (api.body = "file_id")
    2: FileNodeType FileNodeType  (api.body = "file_node_type")
    3: string FileName (api.body = "file_name")
    4: bool HasChildrenNodes (api.body = "has_children_nodes")
    5: optional list<FileNode> ChildrenNodes (api.body = "children_nodes")
    6: optional string Icon (api.body = "icon")
    7: FileType FileType (api.body = "file_type")
    8: optional string FileURL (api.body="file_url")
    9: optional string SpaceId (api.body="space_id") // wiki, 知识空间id
    10: optional string SpaceType (api.body="space_type") // wiki, 表示知识空间类型（团队空间 或 个人空间）
    11: optional string ObjToken (api.body="obj_token") // wiki, 对应文档类型的token，可根据 obj_type 判断属于哪种文档类型
    12: optional string ObjType (api.body="obj_type") // wiki, 文档类型，对于快捷方式，该字段是对应的实体的obj_type
    13: i64 CreateTime (api.body="create_time")
    14: i64 UpdateTime (api.body="update_time") 
}

enum DocSourceType {
    DocSourceTypeDrive = 1
    DocSourceTypeWiki = 2
    DocSourceTypeWeChat = 3
}
enum TimeFilterEnum {
    TimeUnlimited = 0
    WithinAWeek = 1
    WithinAMonth = 2
    WithinAYear = 3
}
struct MGetAuthInfoRequest {
    1: required list<string> ConnectorIDList (api.body="connector_id_list",api.js_conv="true")
    2: required string domain (api.header="host")

    255: optional base.Base Base
}
struct MGetAuthInfoResponse {
    1: optional map<string, list<AuthInfo>> AuthInfoMap (api.body="auth_info_map")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct AuthInfo {
    1: i64 AuthID (api.js_conv="true",api.body="auth_id")
    2: ConnectorID ConnectorID (api.js_conv="true",api.body="connector_id")
    3: string Name (api.body = "name")
    4: string Icon (api.body = "icon")
}

struct DataSourceOAuthConsentURLRequest {
    1: required ConnectorID ConnectorID (api.js_conv="true",api.body="connector_id")
    2: required string RedirectURL (api.body="redirect_url")
    3: required string domain (api.header="host",api.none="true")

    255: optional base.Base Base
}


struct DataSourceOAuthConsentURLResponse {
    1: optional string ConsentURL (agw.key="consent_url")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}


struct DataSourceOAuthCompleteRequest {
    1: required string Code (api.body="code")
    2: required string State (api.body="state")
    3: required string domain (api.header="host")
    255: optional base.Base Base
}

struct DataSourceOAuthCompleteResponse {
    1: i32 StatusCode(api.body = "http_code")
    2: string RedirectURL(api.header="Location")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct GetFileTreeDocListRequest {
    1: required i64 AuthID  (api.js_conv="true", agw.cli_conv="str", api.body="auth_id")
    2: required list<FileNodeType> FileTypeList  (api.body="file_type_list")
    3: optional string FolderID (api.body="folder_id")
    4: optional string PageToken (api.body="page_token")
    5: optional string SpaceId (api.body="space_id")
    6: required DocSourceType DocSourceType (api.body="doc_source_type")
    8: optional string  SearchKeywords (api.body="search_keywords") 
    255: optional base.Base Base
}

struct GetFileTreeDocListResponse {
    1: optional list<FileNode> FileTreeDocList (api.body="file_tree_doc_list") // 三方数据平台文件列表
    2: bool HasMore (api.body="has_more") // 是否还有下一页
    3: string PageToken (api.body="page_token") // 分页token
    4: i64 TotalCount


    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct SearchDocumentRequest {
    1: required i64 AuthID  (api.js_conv="true", agw.cli_conv="str", api.body="auth_id")
    2: required string SearchQuery (api.body="search_query")
    3: required list<FileNodeType> FileTypeList  (api.body="file_type_list")
    4: required DocSourceType DocSourceType (api.body="doc_source_type")
    5: optional string PageToken (api.body="page_token")
    6: optional i64 OffSet (api.body="offset")

    255: optional base.Base Base
}

struct SearchDocumentResponse {
    1: list<FileNode> documents
    2: bool HasMore
    3: string PageToken
    4: i64 OffSet

    255: optional base.BaseResp BaseResp
}

struct ConnectionFileNode {
    1: required i64 AuthID (api.js_conv="true", agw.cli_conv="str", api.body="auth_id")
    2: required FileNodeType FileNodeType (api.body="file_node_type")
    3: required list<FileNode> FileNodeList (api.body="file_node_list")
}

struct SubmitConnectionTaskRequest {
    1: required list<ConnectionFileNode> ConnectionFileNodeList (api.body="connection_file_node_list")

    255: optional base.Base Base
}
enum ConnectionStatus {
    ConnectionStatusEnable = 1
    ConnectionStatusDelete = 2
    ConnectionStatusExpire = 3
}
struct ConnectionInfo {
    1: i64 ConnectionID (api.js_conv="true", agw.cli_conv="str", api.body="connection_id")
    2: string ConnectionName (api.body = "connection_name")
    3: string ConnectionIcon (api.body = "connection_icon")
    4: ConnectionStatus Status (api.body = "status")
    5: i64 SourceID (api.body = "source_id")
    6: i64 DestinationID (api.body = "destination_id")
    7: optional i64 InstanceID (api.js_conv="true", agw.cli_conv="str", api.body="instance_id")
}

struct SubmitConnectionTaskResponse {
    1: optional list<ConnectionInfo> ConnectionInfoList (api.body="connection_info_list")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}

struct PollConnectionTaskRequest {
    1: required list<i64> InstanceIDList (api.js_conv="true", agw.cli_conv="str", api.body="instance_id_list")
    2: required FileNodeType FileNodeType (api.body="file_node_type")

    255: optional base.Base Base
}

enum FileNodeType {
    Folder = 1
    Document = 2
    Sheet = 3
    Space = 4
}

struct PollConnectionTaskResponse {
    1: optional list<ConnectionTask> ConnectionTask (api.body="connection_task")

    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp(api.none="true")
}
typedef string InstanceStatus
    const InstanceStatus InstanceStatusCancel = "cancel"
    const InstanceStatus InstanceStatusProcess = "process"
    const InstanceStatus InstanceStatusSuccess = "success"
    const InstanceStatus InstanceStatusFailure = "failure"
    const InstanceStatus InstanceStatusPartialFailure = "partial_failure"

typedef string EntityRecordStatus
    const EntityRecordStatus EntityRecordStatusProcess = "process"
    const EntityRecordStatus EntityRecordStatusSuccess = "success"
    const EntityRecordStatus EntityRecordStatusFailure = "failure"

struct EntityTask {
    1: i64 EntityID (api.js_conv="true", agw.cli_conv="str", api.body="entity_id")
    2: i64 ConnectionID (api.js_conv="true", agw.cli_conv="str", api.body="connection_id")
    3: string FileID (api.body = "file_id")
    4: string FileName (api.body = "file_name")
    5: EntityRecordStatus Status (api.body = "status")
    6: FileNodeType FileNodeType  (api.body = "file_node_type")
    7: optional string TosKey (api.body = "tos_key")
    8: optional string FileUrl (api.body = "file_url")
    9: optional string ErrorMsg (api.body = "error_msg")
    10: optional string FileSize (api.body = "file_size")
    11: i64 InstanceID (api.js_conv="true", agw.cli_conv="str", api.body="instance_id")
    12: i64 RecordID (api.js_conv="true", agw.cli_conv="str", api.body="record_id")
    13: optional i64 ErrorCode  (api.body = "error_code")
}

struct ConnectionTask {
    1: i64 ConnectionID (api.js_conv="true", agw.cli_conv="str", api.body="connection_id")
    2: InstanceStatus Status (api.body = "status")
    3: list<EntityTask> EntityTaskList (api.body = "entity_task_list")
    4: i64 InstanceID (api.js_conv="true", agw.cli_conv="str", api.body="instance_id")
}