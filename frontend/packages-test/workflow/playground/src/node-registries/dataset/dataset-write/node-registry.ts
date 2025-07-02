import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DATASET_WRITE_FORM_META } from './form-meta';

export const DATASET_WRITE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.DatasetWrite,
  meta: {
    nodeDTOType: StandardNodeType.DatasetWrite,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    style: {
      width: 484,
    },
    size: { width: 484, height: 416 },
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: '/inputs/inputParameters',
    test,
    helpLink: '/open/docs/guides/knowledge_base_writing_node',
  },
  formMeta: DATASET_WRITE_FORM_META,
};
