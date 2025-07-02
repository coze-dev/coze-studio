import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { VARIABLE_ASSIGN_FORM_META } from './form-meta';

export const VARIABLE_ASSIGN_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.VariableAssign,
    meta: {
      nodeDTOType: StandardNodeType.VariableAssign,
      style: {
        width: 360,
      },
      size: { width: 360, height: 130.7 },
      nodeMetaPath: DEFAULT_NODE_META_PATH,
      inputParametersPath: '/$$input_decorator$$/inputParameters',
      test,
      helpLink: '/open/docs/guides/variable_assign_node',
    },
    variablesMeta: {
      outputsPathList: [],
      inputsPathList: [],
    },
    formMeta: VARIABLE_ASSIGN_FORM_META,
  };
