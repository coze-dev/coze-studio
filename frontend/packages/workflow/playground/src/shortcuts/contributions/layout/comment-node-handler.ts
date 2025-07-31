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

import type {
  LayoutNode,
  LayoutStore,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

import { QuadTree } from './quad-tree';

export interface CommentContext {
  store: LayoutStore;
  quadTree: QuadTree;
}

const getQuadTree = (context: CommentContext): QuadTree => {
  const nodes = context.store.nodes.filter(
    node =>
      ![StandardNodeType.Comment, FlowNodeBaseType.SUB_CANVAS].includes(
        node.entity.flowNodeType as StandardNodeType | FlowNodeBaseType,
      ),
  );
  context.quadTree = QuadTree.create(nodes);
  return context.quadTree;
};

export const commentNodeHandler = (
  node: LayoutNode,
  context: CommentContext,
) => {
  if (node.entity.flowNodeType !== StandardNodeType.Comment) {
    return;
  }
  const quadTree = getQuadTree(context);
  const followToNode = QuadTree.find(quadTree, node);
  if (!followToNode) {
    return;
  }
  // Add a small offset to prevent the following node from changing after triggering twice in a row
  node.offset = {
    x: 0,
    y: -5,
  };
  return {
    followTo: followToNode.id,
  };
};
