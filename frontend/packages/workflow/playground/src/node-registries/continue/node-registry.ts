import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { CONTINUE_FORM_META } from './form-meta';

export const CONTINUE_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.Continue,
  meta: {
    isNodeEnd: true,
    hideTest: true,
    nodeDTOType: StandardNodeType.Continue,
    defaultPorts: [{ type: 'input' }],
    size: { width: 360, height: 67.86 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
  },
  formMeta: CONTINUE_FORM_META,
  getOutputPoints: () => [], // Continue 节点没有输出
};
