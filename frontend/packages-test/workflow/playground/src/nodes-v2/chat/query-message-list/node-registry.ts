import { StandardNodeType } from '@coze-workflow/base';

import { createNodeRegistry } from '../create-node-registry';
import { test } from './node-test';
import { QUERY_MESSAGE_LIST_FORM_META } from './form-meta';
import { FIELD_CONFIG } from './constants';

export const QUERY_MESSAGE_LIST_NODE_REGISTRY = createNodeRegistry(
  StandardNodeType.QueryMessageList,
  QUERY_MESSAGE_LIST_FORM_META,
  FIELD_CONFIG,
  { test },
);
