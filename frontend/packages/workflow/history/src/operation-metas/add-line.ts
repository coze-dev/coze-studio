import {
  type AddOrDeleteLineOperationValue,
  FreeOperationType,
  WorkflowDocument,
  WorkflowLinesManager,
} from '@flowgram-adapter/free-layout-editor';
import { type PluginContext } from '@flowgram-adapter/free-layout-editor';
import { type OperationMeta } from '@flowgram-adapter/free-layout-editor';

import { shouldMerge } from '../utils/should-merge';

export const addLineOperationMeta: OperationMeta<
  AddOrDeleteLineOperationValue,
  PluginContext,
  void
> = {
  type: FreeOperationType.addLine,
  inverse: op => ({
    ...op,
    type: FreeOperationType.deleteLine,
  }),
  apply: (operation, ctx: PluginContext) => {
    const linesManager = ctx.get<WorkflowLinesManager>(WorkflowLinesManager);
    const document = ctx.get<WorkflowDocument>(WorkflowDocument);

    if (!operation.value.to || !document.getNode(operation.value.to)) {
      return;
    }

    linesManager.createLine({
      ...operation.value,
      key: operation.value.id,
    });
  },
  shouldMerge,
};
