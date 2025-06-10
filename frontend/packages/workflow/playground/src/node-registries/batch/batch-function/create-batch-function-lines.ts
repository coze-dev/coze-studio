import type { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { delay } from '@flowgram-adapter/common';

/** 生成连线 */
export const createBatchFunctionLines = async (params: {
  document: WorkflowDocument;
  batchId: string;
  batchFunctionId: string;
}) => {
  await delay(30); // 等待节点创建完毕
  const { document, batchId, batchFunctionId } = params;
  document.linesManager.createLine({
    from: batchId,
    to: batchFunctionId,
    fromPort: 'batch-output-to-function',
    toPort: 'batch-function-input',
  });
};
