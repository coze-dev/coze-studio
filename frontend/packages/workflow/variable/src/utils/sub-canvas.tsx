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
 * Get the actual parent node
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
 * Get the actual sub-node
 * @param node
 * @returns
 */
export function getChildrenNode(node: FlowNodeEntity): FlowNodeEntity[] {
  const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(node);

  if (subCanvas) {
    // There is no child on the canvas itself.
    if (subCanvas.isCanvas) {
      return [];
    } else {
      return subCanvas.canvasNode.collapsedChildren;
    }
  }

  return node.document.originTree.getChildren(node);
}

/**
 * Does the node contain a child canvas?
 * @param node
 * @returns
 */
export function hasChildCanvas(node: FlowNodeEntity): boolean {
  const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(node);

  return !!subCanvas?.canvasNode;
}

/**
 * Get the scope chain of all output variables of the sub-node
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
 * Get the parent node's
 * @param node
 * @returns
 */
export function getParentPublic(node: FlowNodeEntity): Scope | undefined {
  return getParentNode(node)?.getData(FlowNodeVariableData)?.public;
}
