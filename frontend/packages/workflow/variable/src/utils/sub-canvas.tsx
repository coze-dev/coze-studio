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
 
import {
  FlowNodeVariableData,
  type Scope,
} from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeMeta } from '@flowgram-adapter/free-layout-editor';

/**
 * 获取实际的父节点
 * @param node
 * @returns
 */
export function getParentNode(
  node: FlowNodeEntity,
): FlowNodeEntity | undefined {
  const initParent = node.document.originTree.getParent(node);

  if (!initParent) {
    return initParent;
  }
  const nodeMeta = initParent.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(initParent);
  if (subCanvas?.isCanvas) {
    return subCanvas.parentNode;
  }

  return initParent;
}

/**
 * 获取实际的子节点
 * @param node
 * @returns
 */
export function getChildrenNode(node: FlowNodeEntity): FlowNodeEntity[] {
  const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(node);

  if (subCanvas) {
    // 子画布本身不存在 children
    if (subCanvas.isCanvas) {
      return [];
    } else {
      return subCanvas.canvasNode.collapsedChildren;
    }
  }

  return node.document.originTree.getChildren(node);
}

/**
 * 节点是否包含子画布
 * @param node
 * @returns
 */
export function hasChildCanvas(node: FlowNodeEntity): boolean {
  const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(node);

  return !!subCanvas?.canvasNode;
}

/**
 * 获取子节点所有输出变量的作用域链
 * @param node
 * @returns
 */
export function getHasChildCanvasNodePublicDeps(
  node: FlowNodeEntity,
  includePrivate = true,
): Scope[] {
  const _private = node.getData(FlowNodeVariableData)?.private;

  return getChildrenNode(node)
    .map(_node => _node.getData(FlowNodeVariableData).public)
    .concat(_private && includePrivate ? [_private] : []);
}

/**
 * 获取父节点的
 * @param node
 * @returns
 */
export function getParentPublic(node: FlowNodeEntity): Scope | undefined {
  return getParentNode(node)?.getData(FlowNodeVariableData)?.public;
}
