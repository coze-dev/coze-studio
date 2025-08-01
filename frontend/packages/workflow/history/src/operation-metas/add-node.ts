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

import { cloneDeep } from 'lodash-es';
import {
  type AddOrDeleteWorkflowNodeOperationValue,
  FreeOperationType,
  WorkflowDocument,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import { type PluginContext } from '@flowgram-adapter/free-layout-editor';
import { type OperationMeta } from '@flowgram-adapter/free-layout-editor';

import { shouldMerge } from '../utils/should-merge';

export const addNodeOperationMeta: OperationMeta<
  AddOrDeleteWorkflowNodeOperationValue,
  PluginContext,
  void
> = {
  type: FreeOperationType.addNode,
  inverse: op => ({
    ...op,
    type: FreeOperationType.deleteNode,
  }),
  apply: (operation, ctx: PluginContext) => {
    const document = ctx.get<WorkflowDocument>(WorkflowDocument);
    document.createWorkflowNode(
      cloneDeep(operation.value.node) as WorkflowNodeJSON,
      true,
      operation.value.parentID,
    );
  },
  shouldMerge,
};
