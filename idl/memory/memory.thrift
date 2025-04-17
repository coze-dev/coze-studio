include "../base.thrift"
include "./patch.thrift"
include "./common.thrift"

namespace go memory

struct GetSysVariableConfRequest {
    255: optional base.Base Base
}

struct GetSysVariableConfResponse {
    1: list<VariableInfo> conf
    2: list<GroupVariableInfo> group_conf
    253: required i32    code (api.body = 'code')
    254: required string msg (api.body = 'msg')
}

struct GroupVariableInfo {
    1: string group_name
    2: string group_desc
    3: string group_ext_desc
    4: list<VariableInfo> var_info_list
    5: list<GroupVariableInfo> sub_group_info
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


struct GetProjectVariableListReq  {
    1: string ProjectID
    2: i64 UserID
    3: i64 version (agw.js_conv="str") 
    255: optional base.Base Base
}

struct GetProjectVariableListResp {
    1: list<common.Variable> VariableList
    2: bool CanEdit
    3: list<patch.GroupVariableInfo> GroupConf

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}





struct UpdateProjectVariableReq  {
    1: string ProjectID
    2: i64 UserID
    3: list<common.Variable> VariableList

    255: optional base.Base Base
}

struct UpdateProjectVariableResp  {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}


enum VariableConnector{
   Bot = 1
   Project = 2
}

struct GetMemoryVariableMetaReq  {
    1: string ConnectorID
    2: VariableConnector ConnectorType
    3: optional string version

    255: optional base.Base Base
}

//应该是给workflow用的rpc接口，不需要鉴权，VariableChannel
struct GetMemoryVariableMetaResp {
    1: map<common.VariableChannel, list<common.Variable>> VariableMap

    255: required base.BaseResp BaseResp
}