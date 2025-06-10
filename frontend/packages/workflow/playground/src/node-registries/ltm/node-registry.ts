import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { LTM_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const LTM_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.LTM,
  meta: {
    nodeDTOType: StandardNodeType.LTM,
    size: { width: 360, height: 130.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: INPUT_PATH, // 入参路径，试运行等功能依赖该路径提取参数
    test,
    helpLink: '/open/docs/guides/ltm_node',
  },
  formMeta: LTM_FORM_META,
};
