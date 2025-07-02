import { StandardNodeType } from '@coze-workflow/base';

import { createNodeRegistry } from '../create-node-registry';
import { test } from './node-test';
import { FORM_META } from './form-meta';

export const QUERY_CONVERSATION_LIST_NODE_REGISTRY = createNodeRegistry(
  StandardNodeType.QueryConversationList,
  FORM_META,
  {},
  { test },
);
