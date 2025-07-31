namespace go intelligence.common

enum IntelligenceStatus {
    Using = 1,
    Deleted = 2,
    Banned = 3,
    MoveFailed = 4, // Migration failed

    Copying    = 5, // Copying
    CopyFailed = 6, // Copy failed
}

enum IntelligenceType {
    Bot = 1
    Project = 2
}

struct IntelligenceBasicInfo {
    1: i64                          id (agw.js_conv="str", api.js_conv="true"),
    2: string                       name,
    3: string                       description,
    4: string                       icon_uri,
    5: string                       icon_url,
    6: i64                          space_id (agw.js_conv="str", api.js_conv="true"),
    7: i64                          owner_id (agw.js_conv="str", api.js_conv="true"),
    8: i64                          create_time (agw.js_conv="str", api.js_conv="true"),
    9: i64                          update_time (agw.js_conv="str", api.js_conv="true"),
    10: IntelligenceStatus          status,
    11: i64                         publish_time (agw.js_conv="str", api.js_conv="true"),
    12: optional string             enterprise_id,
    13: optional i64                organization_id,
}
