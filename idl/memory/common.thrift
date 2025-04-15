namespace go memory_common

struct Variable{
    1: string Keyword
    2: string DefaultValue
    3: VariableType VariableType
    4: VariableChannel Channel
    5: string Description
    6: bool Enable
    7: optional list<string> EffectiveChannelList //生效渠道
    8: string Schema //新老数据都会有schema，除项目变量外其他默认为string
    9: bool IsReadOnly
}

enum VariableChannel{
    Custom   = 1
    System   = 2
    Location = 3
    Feishu   = 4
    APP      = 5 // 项目变量
}

enum VariableType{
    KVVariable   = 1
    ListVariable = 2
}
