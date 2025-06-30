import { cloneDeep } from 'lodash-es';
import {
  type AddOrDeleteWorkflowNodeOperationValue,
  FreeOperationType,
  WorkflowDocument,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import { type PluginContext } from '@flowgram-adapter/free-layout-editor';
import { type OperationMeta } from '@flowgram-adapter/free-layout-editor';

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
  shouldMerge: (_op, prev, element) =>
    !!(prev && Date.now() - element.getTimestamp() < 500),
};
