import {
  DEFAULT_NODE_META_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { LLM_FORM_META } from './llm-form-meta';

export const LLM_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.LLM,
  meta: {
    nodeDTOType: StandardNodeType.LLM,
    style: {
      width: 360,
    },
    size: { width: 360, height: 130.7 },
    test,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    batchPath: '/batch',
    inputParametersPath: '/$$input_decorator$$/inputParameters',
    getLLMModelIdsByNodeJSON: nodeJSON =>
      nodeJSON.data.inputs.llmParam.find(p => p.name === 'modelType')?.input
        .value.content,
    helpLink: '/open/docs/guides/llm_node',
  },
  formMeta: LLM_FORM_META,
};
