import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { QUESTION_FORM_META } from './form-meta';

export const QUESTION_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Question,
  meta: {
    nodeDTOType: StandardNodeType.Question,
    size: { width: DEFAULT_NODE_SIZE.width, height: 156.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    useDynamicPort: true,
    inputParametersPath: '/inputParameters',
    getLLMModelIdsByNodeJSON: nodeJSON =>
      nodeJSON?.data?.inputs?.llmParam?.modelType,
    test,
    helpLink: '/open/docs/guides/question_node',
  },
  formMeta: QUESTION_FORM_META,
};
