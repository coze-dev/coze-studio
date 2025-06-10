import {
  type FlowNodeEntity,
  type IPoint,
} from '@flowgram-adapter/fixed-layout-editor';

export interface CustomLine {
  from: FlowNodeEntity;
  to: FlowNodeEntity;
  fromPoint: IPoint;
  toPoint: IPoint;
  activated?: boolean;
}

/**
 * 资源 icon 类型
 */
export enum NodeType {
  WORKFLOW, // 工作流
  CHAT_FLOW, // 对话流
  KNOWLEDGE, // 知识库
  PLUGIN, // 插件
  DATABASE, // 数据库
}

/**
 * 资源来源
 */
export enum DependencyOrigin {
  LIBRARY, // 资源库
  APP, // App / Project
  SHOP, // 商店
}

export interface EdgeItem {
  from: string;
  to: string;
  collapsed?: boolean;
}
