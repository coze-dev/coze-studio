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
import { START_FORM_META } from './form-meta';

export const START_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Start,
  meta: {
    isStart: true,
    nodeDTOType: StandardNodeType.Start,
    size: { width: 360, height: 78.7 },
    deleteDisable: true,
    copyDisable: true,
    headerReadonly: true,
    showTrigger: ({ projectId }) =>
      // The community version does not support the project trigger feature, for future expansion
      (!!projectId || IS_BOT_OP) && !IS_OPEN_SOURCE,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    // 没有 input port
    defaultPorts: [{ type: 'output' }],
    helpLink: '/open/docs/guides/start_end_node',
    test,
  },
  variablesMeta: WorkflowNodeVariablesMeta.DEFAULT,
  formMeta: START_FORM_META,
};
