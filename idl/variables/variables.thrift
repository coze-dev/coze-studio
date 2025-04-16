include "../base.thrift"

namespace go variables

struct GetSysVariableConfRequest {
    255: optional base.Base Base
}

struct GetSysVariableConfResponse {
    1: list<VariableInfo> conf
    2: list<GroupVariableInfo> group_conf
    253: required i32    code (api.body = 'code')
    254: required string msg (api.body = 'msg')
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
