include "../../../base.thrift"

enum VariableType{
    KVVariable   = 1
    ListVariable = 2
}

enum VariableChannel{
    Custom   = 1
    System   = 2
    Location = 3
    Feishu   = 4
    APP      = 5 // project variable
}

struct Variable{
    1: string Keyword
    2: string DefaultValue
    3: VariableType VariableType
    4: VariableChannel Channel
    5: string Description
    6: bool Enable
    7: optional list<string> EffectiveChannelList //effective channel
    8: string Schema //New and old data will have schemas, except for project variables, the default is string.
    9: bool IsReadOnly
}

struct GroupVariableInfo{
    1: string GroupName
    2: string GroupDesc
    3: string GroupExtDesc
    4: list<Variable> VarInfoList
    5: list<GroupVariableInfo> SubGroupList
    6: bool IsReadOnly
    7: optional VariableChannel DefaultChannel
}


struct GetProjectVariableListReq  {
    1: string ProjectID
    2: i64 UserID
    3: i64 version (agw.js_conv="str", api.js_conv="true")
    255: optional base.Base Base
}

struct GetProjectVariableListResp {
    1: list<Variable> VariableList
    2: bool CanEdit
    3: list<GroupVariableInfo> GroupConf

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateProjectVariableReq  {
    1: string ProjectID
    2: i64 UserID
    3: list<Variable> VariableList

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

//It should be the rpc interface for workflow, no authentication is required, VariableChannel
struct GetMemoryVariableMetaResp {
    1: map<VariableChannel, list<Variable>> VariableMap

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp
}


