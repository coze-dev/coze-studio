import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
  WorkflowNodeVariablesMeta,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { INPUT_FORM_META } from './form-meta';

export const INPUT_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Input,
  meta: {
    nodeDTOType: StandardNodeType.Input,
    size: { width: 360, height: 78.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    test,
    helpLink: '/open/docs/guides/input_node',
  },
  variablesMeta: WorkflowNodeVariablesMeta.DEFAULT,
  formMeta: INPUT_FORM_META,
};
