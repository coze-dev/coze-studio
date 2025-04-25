namespace go intelligence.common

struct UserLabel {
    1: string             label_id ,
    2: string             label_name ,
    3: string             icon_uri ,
    4: string             icon_url  ,
    5: string             jump_link ,
}

struct User {
    1: i64 user_id (agw.js_conv="str", api.js_conv="true"),
    2: string nickname, // 用户昵称
    3: string avatar_url, // 用户头像
    4: string user_unique_name, // 用户名
    5: UserLabel user_label, // 用户标签
}


/****************************** audit **********************************/
enum AuditStatus {
    Auditing = 0, // 审核中
    Success  = 1, // 审核通过
    Failed   = 2, // 审核失败
}

struct AuditInfo {
    1: optional AuditStatus audit_status,
    2: optional string publish_id,
    3: optional string commit_version,
}

// 审核结果
struct AuditData  {
    1:          bool   check_not_pass    // true：机审校验不通过
    2: optional string check_not_pass_msg // 机审校验不通过文案
}


/****************************** publish **********************************/
enum ConnectorDynamicStatus {
    Normal          = 0
    Offline         = 1
    TokenDisconnect = 2
}

struct ConnectorInfo {
    1:          string                 id
    2:          string                 name
    3:          string                 icon
    4:          ConnectorDynamicStatus connector_status
    5: optional string                 share_link
}

struct IntelligencePublishInfo {
    1: string                      publish_time,
    2: bool                        has_published,
    3: list<ConnectorInfo>         connectors,
}

enum ResourceType {
    Plugin = 1
    Workflow = 2
    Imageflow = 3
    Knowledge = 4
    UI = 5
    Prompt = 6
    Database = 7
    Variable = 8
}

enum OrderByType {
    Asc = 1
    Desc = 2
}

enum PermissionType {
    NoDetail = 1 //不能查看详情
    Detail = 2 //可以查看详情
    Operate = 3 //可以查看和操作
}

enum SpaceStatus {
    Valid = 1
    Invalid = 2
}

struct Space {
    1: i64 id,
    2: i64 owner_id,
    3: SpaceStatus status,
    4: string name,
}