import type { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowEdgeJSON,
  WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';

import type { StandardNodeType } from './node-type';

export interface WorkflowNodeJSON<T = Record<string, unknown>> {
  id: string;
  type: StandardNodeType | FlowNodeBaseType | string;
  meta?: WorkflowNodeMeta;
  data: T;
  version?: string;
  blocks?: WorkflowNodeJSON[];
  edges?: WorkflowEdgeJSON[];
}

export interface WorkflowJSON {
  nodes: WorkflowNodeJSON[];
  edges: WorkflowEdgeJSON[];
}

// 节点模版类型
export { NodeTemplateType } from '@coze-arch/bot-api/workflow_api';
