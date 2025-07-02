import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DATABASE_NODE_FORM_META } from './form-meta';

export const DATABASE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Database,
  meta: {
    nodeDTOType: StandardNodeType.Database,
    style: {
      width: 484,
    },
    size: DEFAULT_NODE_SIZE,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    test,
    helpLink: '/open/docs/guides/database_sql_node',
  },
  formMeta: DATABASE_NODE_FORM_META,
};
