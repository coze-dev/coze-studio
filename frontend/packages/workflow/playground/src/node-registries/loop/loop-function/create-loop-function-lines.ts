import type { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { delay } from '@flowgram-adapter/common';

/** 生成连线 */
export const createLoopFunctionLines = async (params: {
  document: WorkflowDocument;
  loopId: string;
  loopFunctionId: string;
}) => {
  await delay(30); // 等待节点创建完毕
  const { document, loopId, loopFunctionId } = params;
  document.linesManager.createLine({
    from: loopId,
    to: loopFunctionId,
    fromPort: 'loop-output-to-function',
    toPort: 'loop-function-input',
  });
};
