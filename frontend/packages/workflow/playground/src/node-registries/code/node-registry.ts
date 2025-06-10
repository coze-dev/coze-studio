import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { CODE_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const CODE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Code,
  meta: {
    nodeDTOType: StandardNodeType.Code,
    size: DEFAULT_NODE_SIZE,
    style: {
      width: 484,
    },
    test,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: INPUT_PATH, // 入参路径，试运行等功能依赖该路径提取参数
    enableCopilotGenerateTestNodeForm: true,
    helpLink: '/open/docs/guides/code_node',
  },
  formMeta: CODE_FORM_META,
};
