import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { VARIABLE_MERGE_FORM_META } from './variable-merge-form-meta';

export const VARIABLE_MERGE_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.VariableMerge,
  meta: {
    nodeDTOType: StandardNodeType.VariableMerge,
    style: {
      width: 360,
    },
    size: { width: 360, height: 130.7 },
    hideTest: true,
    helpLink: '/open/docs/guides/variable_merge_node',
  },
  formMeta: VARIABLE_MERGE_FORM_META,
};
