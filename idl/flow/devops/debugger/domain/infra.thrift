namespace go flow.devops.debugger.domain.infra
// ComponentType 支持组件类型
enum ComponentType {
    Undefined         = 0
    CozePlugin        = 10000  // Coze Plugin
    CozeTool          = 10001  // Coze Tool
    CozeWorkflow      = 10002  // Coze Workflow
    CozeSubWorkflow   = 10003  // Coze SubWorkflow，即在Workflow中被引用的子Workflow
    CozeLLMNode       = 10004  // Coze workflow中的LLM节点
    CozeCodeNode      = 10005  // Coze workflow中的Code节点
    CozeKnowledgeNode = 10006  // Coze workflow中的Knowledge节点
    CozeToolNode      = 10007  // Coze workflow中的Tool节点
    CozeStartNode     = 10008  // Coze workflow中的start节点
    CozeVariableNode  = 10009  // Coze workflow中的variable节点

    CozeVariableBot   = 20000  // Coze 虚拟节点用于标识 variable 依赖的bot
    CozeVariableChat  = 20001  // Coze 虚拟节点用于标识 variable 依赖的chat
}


// TrafficScene 流量请求场景
enum TrafficScene {
    Undefined            = 0
    CozeSingleAgentDebug = 10000  // 单Agent调试页
    CozeMultiAgentDebug  = 10001  // 多Agent调试页
    CozeToolDebug        = 10002  // Tool调试页
    CozeWorkflowDebug    = 10003  // Workflow调试页
}

// ComponentMappingType 组件映射类型
enum ComponentMappingType {
    Undefined = 0
    MockSet   = 1
}

// BizCtx 业务上下文
struct BizCtx {
    1: optional string              connectorID      // connectorID
    2: optional string              connectorUID     // connector下用户ID
    3: optional TrafficScene        trafficScene     // 业务场景
    4: optional string              trafficCallerID  // 业务场景组件ID，比如Bot调试页，则trafficSceneID为BotID
    5: optional string              bizSpaceID       // 业务线SpaceID，用于访问控制
    6: optional map<string,string>  ext              // 额外信息
}

// ComponentSubject 业务组件的二级结构
struct ComponentSubject {
    1: optional string         componentID          // 组件ID，例如Tool ID、Node ID等
    2: optional ComponentType  componentType        // 组件类型
    3: optional string         parentComponentID    // 父组件ID，例如Tool->Plugin, Node->Workflow
    4: optional ComponentType  parentComponentType  // 父组件类型
}

enum OrderBy {
    UpdateTime = 1
}

struct Creator {
    1: optional string  ID
    2: optional string  name
    3: optional string  avatarUrl
}

enum DebugScene {
    Debug = 0 // 默认play ground Debug场景
}

enum CozeChannel {
    Coze = 0 // 默认为Coze, 未来扩展到其他渠道
}