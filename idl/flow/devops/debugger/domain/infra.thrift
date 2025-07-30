namespace go flow.devops.debugger.domain.infra
// ComponentType Supports component types
enum ComponentType {
    Undefined         = 0
    CozePlugin        = 10000  // Coze Plugin
    CozeTool          = 10001  // Coze Tool
    CozeWorkflow      = 10002  // Coze Workflow
    CozeSubWorkflow   = 10003  // Coze SubWorkflow, which is referenced in Workflow.
    CozeLLMNode       = 10004  // LLM nodes in Coze workflow
    CozeCodeNode      = 10005  // Coding nodes in a Coze workflow
    CozeKnowledgeNode = 10006  // Knowledge nodes in Coze workflow
    CozeToolNode      = 10007  // Tools nodes in Coze workflow
    CozeStartNode     = 10008  // Coze workflow start node
    CozeVariableNode  = 10009  // Cozing variable nodes in workflow

    CozeVariableBot   = 20000  // Coze virtual nodes to identify variable dependent bots
    CozeVariableChat  = 20001  // Coze virtual nodes to identify variable dependent chats
}


// TrafficScene traffic request scenario
enum TrafficScene {
    Undefined            = 0
    CozeSingleAgentDebug = 10000  // Single Agent Debug Page
    CozeMultiAgentDebug  = 10001  // Multi-Agent Debug Page
    CozeToolDebug        = 10002  // Tool Debug Page
    CozeWorkflowDebug    = 10003  // Workflow debugging page
}

// ComponentMappingType Component Mapping Types
enum ComponentMappingType {
    Undefined = 0
    MockSet   = 1
}

// BizCtx Business Context
struct BizCtx {
    1: optional string              connectorID      // connectorID
    2: optional string              connectorUID     // User ID under connector
    3: optional TrafficScene        trafficScene     // business scenario
    4: optional string              trafficCallerID  // Business Scenario Component ID, such as Bot Debug Page, where trafficSceneID is BotID
    5: optional string              bizSpaceID       // Line of business SpaceID for access control
    6: optional map<string,string>  ext              // Additional information
}

// Secondary structure of the ComponentSubject business component
struct ComponentSubject {
    1: optional string         componentID          // Component IDs, such as Tool ID, Node ID, etc
    2: optional ComponentType  componentType        // component type
    3: optional string         parentComponentID    // Parent component ID, e.g. Tool- > Plugin, Node- > Workflow
    4: optional ComponentType  parentComponentType  // Parent component type
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
    Debug = 0 // Default play ground Debug scene
}

enum CozeChannel {
    Coze = 0 // Default to Coze, expand to other channels in the future
}