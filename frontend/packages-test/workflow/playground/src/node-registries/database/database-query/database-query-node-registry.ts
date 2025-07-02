import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DatabaseQueryFormMeta } from './database-query-form-meta';

export const DATABASE_QUERY_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.DatabaseQuery,
    meta: {
      nodeDTOType: StandardNodeType.DatabaseQuery,
      test,
      helpLink: '/open/docs/guides/database_select_node',
    },
    formMeta: DatabaseQueryFormMeta,
  };
