include "../../../base.thrift"
include "../table/table.thrift"

struct KVItem {
    1: string keyword
    2: string value
    3: i64    create_time
    4: i64    update_time
    5: bool   is_system
    6: bool   prompt_disabled
    7: string schema
}

struct VariableInfo {
    1: string key
    2: string default_value
    3: string description
    4: string sensitive
    5: string must_not_use_in_prompt
    6: string can_write
    7: string example
    8: string ext_desc
    9: string group_name
    10: string group_desc
    11: string group_ext_desc
    12: optional list<string> EffectiveChannelList
}

struct GroupVariableInfo {
    1: string group_name
    2: string group_desc
    3: string group_ext_desc
    4: list<VariableInfo> var_info_list
    5: list<GroupVariableInfo> sub_group_info
}

struct SetKvMemoryReq {
    1: required i64          bot_id(agw.js_conv="str", agw.key="bot_id")
    2: optional i64          user_id
    3: required list<KVItem> data
    4: optional i64          connector_id
    5: optional table.RefInfo ref_info // 引用信息
    6: optional string       project_id
    7: optional i64 ProjectVersion

    255: optional base.Base Base
}

struct SetKvMemoryResp {
    255: optional base.BaseResp BaseResp
}


struct GetSysVariableConfRequest {
    255: optional base.Base Base
}

struct GetSysVariableConfResponse {
    1: list<VariableInfo> conf
    2: list<GroupVariableInfo> group_conf

    255: required base.BaseResp BaseResp
}

