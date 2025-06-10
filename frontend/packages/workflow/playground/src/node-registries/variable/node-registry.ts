import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { test, type NodeTestMeta } from './node-test';
import { VARIABLE_NODE_FORM_META } from './form-meta';

export const VARIABLE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Variable,
  meta: {
    nodeDTOType: StandardNodeType.Variable,
    headerReadonly: true,
    headerReadonlyAllowDeleteOperation: true,
    size: { width: DEFAULT_NODE_SIZE.width, height: 156.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    useDynamicPort: true,
    inputParametersPath: '/inputParameters',
    test,
  },
  variablesMeta: {
    outputsPathList: ['outputs'],
    inputsPathList: [],
  },
  formMeta: VARIABLE_NODE_FORM_META,
};
