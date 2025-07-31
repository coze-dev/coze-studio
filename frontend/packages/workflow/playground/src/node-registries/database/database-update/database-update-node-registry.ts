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
