import { StandardNodeType } from '@coze-workflow/base';

import { createNodeRegistry } from '../create-node-registry';
import { test } from './node-test';
import { FORM_META } from './form-meta';
import { FIELD_CONFIG } from './constants';

export const QUERY_CONVERSATION_HISTORY_NODE_REGISTRY = createNodeRegistry(
  StandardNodeType.QueryConversationHistory,
  FORM_META,
  FIELD_CONFIG,
  { test },
);
