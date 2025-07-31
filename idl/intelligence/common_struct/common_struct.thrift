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
    2: string nickname, // user nickname
    3: string avatar_url, // user avatar
    4: string user_unique_name, // user name
    5: UserLabel user_label, // user tag
}


/****************************** audit **********************************/
enum AuditStatus {
    Auditing = 0, // Under review.
    Success  = 1, // approved
    Failed   = 2, // audit failed
}

struct AuditInfo {
    1: optional AuditStatus audit_status,
    2: optional string publish_id,
    3: optional string commit_version,
}

// Audit results
struct AuditData  {
    1:          bool   check_not_pass    // True: The machine audit verification failed
    2: optional string check_not_pass_msg // The machine audit verification failed the copy.
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
    NoDetail = 1 //Can't view details
    Detail = 2 //You can check the details.
    Operate = 3 //Can be viewed and operated
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