/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** ComponentMappingType 组件映射类型 */
export enum ComponentMappingType {
  Undefined = 0,
  MockSet = 1,
}

/** ComponentType 支持组件类型 */
export enum ComponentType {
  Undefined = 0,
  /** Coze Plugin */
  CozePlugin = 10000,
  /** Coze Tool */
  CozeTool = 10001,
  /** Coze Workflow */
  CozeWorkflow = 10002,
  /** Coze SubWorkflow，即在Workflow中被引用的子Workflow */
  CozeSubWorkflow = 10003,
  /** Coze workflow中的LLM节点 */
  CozeLLMNode = 10004,
  /** Coze workflow中的Code节点 */
  CozeCodeNode = 10005,
  /** Coze workflow中的Knowledge节点 */
  CozeKnowledgeNode = 10006,
  /** Coze workflow中的Tool节点 */
  CozeToolNode = 10007,
  /** Coze workflow中的start节点 */
  CozeStartNode = 10008,
  /** Coze workflow中的variable节点 */
  CozeVariableNode = 10009,
  /** Coze 虚拟节点用于标识varibale依赖的bot */
  CozeVariableBot = 20000,
  /** Coze 虚拟节点用于标识varibale依赖的chat */
  CozeVariableChat = 20001,
}

export enum CozeChannel {
  /** 默认为Coze, 未来扩展到其他渠道 */
  Coze = 0,
}

export enum DebugScene {
  /** 默认play ground Debug场景 */
  Debug = 0,
}

export enum OrderBy {
  UpdateTime = 1,
}

/** TrafficScene 流量请求场景 */
export enum TrafficScene {
  Undefined = 0,
  /** 单Agent调试页 */
  CozeSingleAgentDebug = 10000,
  /** 多Agent调试页 */
  CozeMultiAgentDebug = 10001,
  /** Tool调试页 */
  CozeToolDebug = 10002,
  /** Workflow调试页 */
  CozeWorkflowDebug = 10003,
}

/** BizCtx 业务上下文 */
export interface BizCtx {
  /** connectorID */
  connectorID?: string;
  /** connector下用户ID */
  connectorUID?: string;
  /** 业务场景 */
  trafficScene?: TrafficScene;
  /** 业务场景组件ID，比如Bot调试页，则trafficSceneID为BotID */
  trafficCallerID?: string;
  /** 业务线SpaceID，用于访问控制 */
  bizSpaceID?: string;
  /** 额外信息 */
  ext?: Record<string, string>;
}

/** ComponentSubject 业务组件的二级结构 */
export interface ComponentSubject {
  /** 组件ID，例如Tool ID、Node ID等 */
  componentID?: string;
  /** 组件类型 */
  componentType?: ComponentType;
  /** 父组件ID，例如Tool->Plugin, Node->Workflow */
  parentComponentID?: string;
  /** 父组件类型 */
  parentComponentType?: ComponentType;
}

export interface Creator {
  ID?: string;
  name?: string;
  avatarUrl?: string;
}
/* eslint-enable */
