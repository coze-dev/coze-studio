import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DATASET_NODE_FORM_META } from './form-meta';
export const DATASET_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Dataset,
  meta: {
    nodeDTOType: StandardNodeType.Dataset,
    style: {
      width: 484,
    },
    size: { width: DEFAULT_NODE_SIZE.width, height: 130.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: '/inputs/inputParameters',
    test,
    helpLink: '/open/docs/guides/knowledge_node',
  },
  formMeta: DATASET_NODE_FORM_META,
};
