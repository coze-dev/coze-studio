import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { NODE_V2_TYPES, NODES_V2 } from '@/nodes-v2/constants';

export const isNodeV2registry = (registry: WorkflowNodeRegistry) =>
  NODES_V2.some(r => NODE_V2_TYPES.includes(registry.type));

export const isNodeV2 = (node: FlowNodeEntity) =>
  NODE_V2_TYPES.includes(node.flowNodeType);

export const getNodeV2Registry = (nodeType: StandardNodeType) =>
  NODES_V2.find(r => r.type === nodeType);
