import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DatabaseUpdateFormMeta } from './database-update-form-meta';

export const DATABASE_UPDATE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    meta: {
      nodeDTOType: StandardNodeType.DatabaseUpdate,
      test,
      helpLink: '/open/docs/guides/database_update_node',
    },
    type: StandardNodeType.DatabaseUpdate,
    formMeta: DatabaseUpdateFormMeta,
  };
