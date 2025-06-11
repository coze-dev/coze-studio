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
