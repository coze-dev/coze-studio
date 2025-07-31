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

import { inject, injectable } from 'inversify';
import { EntityManager } from '@flowgram-adapter/free-layout-editor';
import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { BatchMode } from '@coze-workflow/base';

import { type ViewVariableTreeNode, ViewVariableType } from '../typings';
import { WorkflowVariableService } from './workflow-variable-service';
import { variableUtils } from './variable-utils';

@injectable()
export class WorkflowBatchService {
  @inject(WorkflowVariableService)
  readonly variablesService: WorkflowVariableService;
  @inject(EntityManager) readonly entityManager: EntityManager;

  static singleOutputMetasToList(
    metas: ViewVariableTreeNode[] | undefined,
  ): ViewVariableTreeNode[] {
    const singleMetas = metas || [
      WorkflowBatchService.getDefaultBatchModeOutputMeta(BatchMode.Single),
    ];
    return [
      {
        key: nanoid(),
        type: ViewVariableType.ArrayObject,
        name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Batch],
        children: singleMetas,
      },
    ];
  }

  static listOutputMetasToSingle(
    metas: ViewVariableTreeNode[] | undefined,
  ): ViewVariableTreeNode[] | undefined {
    const listMetas = metas || [
      WorkflowBatchService.getDefaultBatchModeOutputMeta(BatchMode.Batch),
    ];
    return listMetas[0].children;
  }

  static getDefaultBatchModeOutputMeta = (
    batchMode: BatchMode,
  ): ViewVariableTreeNode => {
    if (batchMode === BatchMode.Batch) {
      return {
        key: nanoid(),
        type: ViewVariableType.ArrayObject,
        name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Batch],
        children: [
          {
            key: nanoid(),
            type: ViewVariableType.ArrayString,
            name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Single],
          },
        ],
      };
    }
    if (batchMode === BatchMode.Single) {
      return {
        key: nanoid(),
        type: ViewVariableType.String,
        name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Single],
      };
    }
    throw new Error('WorkflowBatchService Error: Unknown batchMode');
  };
}
