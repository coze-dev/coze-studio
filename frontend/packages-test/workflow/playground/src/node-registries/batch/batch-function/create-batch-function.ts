import type {
  WorkflowDocument,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';
import type { WorkflowNodeJSON } from '@coze-workflow/base';

import { BatchFunctionIDPrefix } from './relation';
import { createBatchFunctionTemplateData } from './create-batch-function-template-data';
import { createBatchFunctionLines } from './create-batch-function-lines';
import { createBatchFunctionJSON } from './create-batch-function-json';

/** 创建 Batch 循环体节点 */
export const createBatchFunction = async (
  batchNode: WorkflowNodeEntity,
  batchJson: WorkflowNodeJSON,
) => {
  const document = batchNode.document as WorkflowDocument;
  const id = `${BatchFunctionIDPrefix}${batchNode.id}`;
  const batchPosition: IPoint = {
    x: batchJson.meta?.position?.x || 0,
    y: batchJson.meta?.position?.y || 0,
  };
  const offset: IPoint = {
    x: 0,
    y: 200,
  };
  const position = {
    x: batchPosition.x + offset.x,
    y: batchPosition.y + offset.y,
  };
  const batchFunctionJSON = createBatchFunctionJSON(id, position);
  const batchFunctionNode =
    await document.createWorkflowNode(batchFunctionJSON);
  createBatchFunctionTemplateData(batchNode, batchFunctionNode);
  createBatchFunctionLines({
    document,
    batchId: batchNode.id,
    batchFunctionId: batchFunctionNode.id,
  });
};
