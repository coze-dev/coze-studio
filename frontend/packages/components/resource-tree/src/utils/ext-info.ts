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

import { isEmpty } from 'lodash-es';
import {
  type FlowNodeEntity,
  FlowNodeBaseType,
} from '@flowgram-adapter/fixed-layout-editor';

export const getStoreNode = (node: FlowNodeEntity) => {
  const isBlockOrderIcon =
    node.flowNodeType === FlowNodeBaseType.BLOCK_ORDER_ICON;
  const isBlockIcon = node.flowNodeType === FlowNodeBaseType.BLOCK_ICON;
  return {
    node: isBlockOrderIcon || isBlockIcon ? node.parent! : node,
    updateCurrent: !(isBlockOrderIcon || isBlockIcon),
  };
};

export const updateNodeExtInfo = (
  renderNode: FlowNodeEntity,
  info: Record<string, any>,
) => {
  const { node, updateCurrent } = getStoreNode(renderNode);
  if (!updateCurrent) {
    renderNode.updateExtInfo(info);
  }
  if (isEmpty(node.getExtInfo())) {
    return;
  } else {
    node.updateExtInfo(info);
  }
};

export const getNodeExtInfo = (renderNode: FlowNodeEntity) => {
  const { node } = getStoreNode(renderNode);
  return node.getExtInfo();
};
