include "./common.thrift"

namespace go memory_patch

struct GroupVariableInfo{
    1: string GroupName
    2: string GroupDesc
    3: string GroupExtDesc
    4: list<common.Variable> VarInfoList
    5: list<GroupVariableInfo> SubGroupList
    6: bool IsReadOnly
    7: optional common.VariableChannel DefaultChannel
}

