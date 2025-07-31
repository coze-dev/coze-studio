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
