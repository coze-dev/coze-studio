import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { IF_FORM_META } from './form-meta';

export const IF_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.If,
  meta: {
    nodeDTOType: StandardNodeType.If,
    style: {
      width: 850,
    },
    size: { width: DEFAULT_NODE_SIZE.width, height: 116.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    useDynamicPort: true,
    defaultPorts: [{ type: 'input' }],
    helpLink: '/open/docs/guides/condition_node',
  },
  formMeta: IF_FORM_META,
};
