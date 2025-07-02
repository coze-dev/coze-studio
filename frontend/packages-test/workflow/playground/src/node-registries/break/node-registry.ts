import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { BREAK_FORM_META } from './form-meta';

export const BREAK_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.Break,
  meta: {
    isNodeEnd: true,
    hideTest: true,
    nodeDTOType: StandardNodeType.Break,
    defaultPorts: [{ type: 'input' }],
    size: { width: 360, height: 67.86 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
  },
  formMeta: BREAK_FORM_META,
  getOutputPoints: () => [], // Break 节点没有输出
};
