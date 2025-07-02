import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { OUTPUT_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const OUTPUT_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.Output,
  meta: {
    hideTest: true,
    nodeDTOType: StandardNodeType.Output,
    size: { width: 360, height: 78.2 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    inputParametersPath: INPUT_PATH, // 入参路径，试运行等功能依赖该路径提取参数
    helpLink: '/open/docs/guides/message_node',
  },
  formMeta: OUTPUT_FORM_META,
};
