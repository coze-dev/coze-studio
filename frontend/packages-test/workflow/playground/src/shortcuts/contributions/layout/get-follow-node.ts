import type { GetFollowNode } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

import { subCanvasHandler } from './sub-canvas-handler';
import {
  type CommentContext,
  commentNodeHandler,
} from './comment-node-handler';

export const getFollowNode: GetFollowNode = (node, context) => {
  if (node.entity.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
    return subCanvasHandler(node);
  }
  if (node.entity.flowNodeType === StandardNodeType.Comment) {
    return commentNodeHandler(node, context as CommentContext);
  }
};
