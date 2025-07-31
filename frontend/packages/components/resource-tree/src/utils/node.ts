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

import { type FlowNodeEntity } from '@flowgram-adapter/fixed-layout-editor';

const getParentOfNoBlock = (
  node: FlowNodeEntity,
): FlowNodeEntity | undefined => {
  if (!node.parent) {
    return undefined;
  }
  if (node.parent.flowNodeType === 'block') {
    return getParentOfNoBlock(node.parent);
  }
  return node.parent;
};

export const getParentChildrenCount = (node: FlowNodeEntity) => {
  const parent = getParentOfNoBlock(node);
  return parent?.children?.length || 0;
};

export const getTreeIdFromNodeId = (id: string) =>
  id.replace('$blockIcon$', '');

export const getNodeIdFromTreeId = (id: string) => `$blockIcon$${id}`;
