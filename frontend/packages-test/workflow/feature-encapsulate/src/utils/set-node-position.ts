import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

import { type Rect } from '../types';

/**
 * 设置节点坐标
 * @param node
 * @returns
 */
export function setNodePosition(
  node: WorkflowNodeJSON,
  position: IPoint,
): void {
  if (!node.meta) {
    node.meta = {};
  }

  node.meta.position = position;
}

/**
 * 根据矩形设置节点坐标
 * @param node
 * @param rect
 */
export function setNodePositionByRect(node: WorkflowNodeJSON, rect: Rect) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  setNodePosition(node, { x: rect.x + rect.width / 2, y: rect.y });
}
