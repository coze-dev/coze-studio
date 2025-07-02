import type {
  WorkflowDocument,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';
import type { WorkflowNodeJSON } from '@coze-workflow/base';

import { LoopFunctionIDPrefix } from './relation';
import { createLoopFunctionTemplateData } from './create-loop-function-template-data';
import { createLoopFunctionLines } from './create-loop-function-lines';
import { createLoopFunctionJSON } from './create-loop-function-json';

/** 创建 Loop 循环体节点 */
export const createLoopFunction = async (
  loopNode: WorkflowNodeEntity,
  loopJson: WorkflowNodeJSON,
) => {
  const document = loopNode.document as WorkflowDocument;
  const id = `${LoopFunctionIDPrefix}${loopNode.id}`;
  const loopPosition: IPoint = {
    x: loopJson.meta?.position?.x || 0,
    y: loopJson.meta?.position?.y || 0,
  };
  const offset: IPoint = {
    x: 0,
    y: 200,
  };
  const position = {
    x: loopPosition.x + offset.x,
    y: loopPosition.y + offset.y,
  };
  const loopFunctionJSON = createLoopFunctionJSON({ id, position, loopNode });
  const loopFunctionNode = await document.createWorkflowNode(loopFunctionJSON);
  createLoopFunctionTemplateData(loopNode, loopFunctionNode);
  createLoopFunctionLines({
    document,
    loopId: loopNode.id,
    loopFunctionId: loopFunctionNode.id,
  });
};
