import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DatabaseDeleteFormMeta } from './database-delete-form-meta';

export const DATABASE_DELETE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.DatabaseDelete,
    meta: {
      nodeDTOType: StandardNodeType.DatabaseDelete,
      test,
      helpLink: '/open/docs/guides/database_delete_node',
    },
    formMeta: DatabaseDeleteFormMeta,
  };
