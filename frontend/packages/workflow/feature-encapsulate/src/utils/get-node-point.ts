import { PositionData } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeJSON,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

/**
 * 获取节点坐标
 * @param node
 * @returns
 */
export function getNodePoint(
  node: WorkflowNodeEntity | WorkflowNodeJSON,
): IPoint {
  if (node instanceof WorkflowNodeEntity) {
    const positionData = node.getData<PositionData>(PositionData);
    return {
      x: positionData.x,
      y: positionData.y,
    };
  }

  return node?.meta?.position || { x: 0, y: 0 };
}
