import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { FORM_META } from './form-meta';

export const TEXT_PROCESS_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Text,
  meta: {
    nodeDTOType: StandardNodeType.Text,
    style: {
      width: 360,
    },
    size: { width: 360, height: 130.7 },
    inputParametersPath: '/inputParameters',
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    test,
    helpLink: '/open/docs/guides/text_processing_node',
  },
  formMeta: FORM_META,
};
