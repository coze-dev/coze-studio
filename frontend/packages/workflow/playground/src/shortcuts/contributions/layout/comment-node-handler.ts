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
  // 加一点小偏移，防止连续触发两次后跟随节点变动
  node.offset = {
    x: 0,
    y: -5,
  };
  return {
    followTo: followToNode.id,
  };
};
