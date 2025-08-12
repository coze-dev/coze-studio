/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
