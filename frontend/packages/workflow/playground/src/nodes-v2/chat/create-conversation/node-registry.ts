import { StandardNodeType } from '@coze-workflow/base';

import { createNodeRegistry } from '../create-node-registry';
import { test } from './node-test';
import { CREATE_CONVERSATION_FORM_META } from './form-meta';
import { FIELD_CONFIG } from './constants';

export const CREATE_CONVERSATION_NODE_REGISTRY = createNodeRegistry(
  StandardNodeType.CreateConversation,
  CREATE_CONVERSATION_FORM_META,
  FIELD_CONFIG,
  { test },
);
