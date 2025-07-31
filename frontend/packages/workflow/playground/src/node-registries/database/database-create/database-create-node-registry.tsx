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

import { get } from 'lodash-es';
import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeTestMeta } from '@/test-run-kit';
import { DatabaseNodeService } from '@/services';

import { test } from './node-test';
import { DatabaseCreateFormMeta } from './database-create-form-meta';

export const DATABASE_CREATE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.DatabaseCreate,
    meta: {
      nodeDTOType: StandardNodeType.DatabaseCreate,
      test,
      helpLink: '/open/docs/guides/database_insert_node',
    },
    formMeta: DatabaseCreateFormMeta,
    onInit: async (nodeJson, context: WorkflowPlaygroundContext) => {
      if (!nodeJson) {
        return;
      }
      const databaseNodeService =
        context.entityManager.getService<DatabaseNodeService>(
          DatabaseNodeService,
        );
      const databaseId =
        nodeJson?.data.inputs.databaseInfoList?.[0]?.databaseInfoID ?? '';
      if (!databaseId) {
        return;
      }
      await databaseNodeService.load(databaseId);
    },
    onDispose: (nodeJson, context: WorkflowPlaygroundContext) => {
      if (!nodeJson) {
        return;
      }
      const databaseNodeService =
        context.entityManager.getService<DatabaseNodeService>(
          DatabaseNodeService,
        );

      const databaseId =
        get(nodeJson, 'inputs.databaseInfoList[0].databaseInfoID') ?? '';
      if (!databaseId) {
        return;
      }
      databaseNodeService.clearDatabaseError(databaseId);
    },
  };
