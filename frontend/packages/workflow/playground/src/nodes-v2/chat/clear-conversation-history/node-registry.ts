import { StandardNodeType } from '@coze-workflow/base';

import { createNodeRegistry } from '../create-node-registry';
import { test } from './node-test';
import { CLEAR_CONTEXT_FORM_META } from './form-meta';
import { FIELD_CONFIG } from './constants';

export const CLEAR_CONTEXT_NODE_REGISTRY = createNodeRegistry(
  StandardNodeType.ClearContext,
  CLEAR_CONTEXT_FORM_META,
  FIELD_CONFIG,
  { test },
);
