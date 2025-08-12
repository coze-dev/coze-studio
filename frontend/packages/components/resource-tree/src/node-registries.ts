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
  type FlowNodeJSON,
  FlowNodeBaseType,
  type FlowNodeEntity,
  type FlowNodeRegister,
} from '@flowgram-adapter/fixed-layout-editor';
/**
 * BlockOrderIcon-free branch nodes
 */
export const Split: FlowNodeRegister = {
  type: 'split',
  extend: 'dynamicSplit',
  onBlockChildCreate(
    originParent: FlowNodeEntity,
    blockData: FlowNodeJSON,
    addedNodes: FlowNodeEntity[] = [], // All newly created nodes must exist here
  ) {
    const { document } = originParent;
    const parent = document.getNode(`$inlineBlocks$${originParent.id}`);
    // The block node will generate an empty block node to cut the block.
    const proxyBlock = document.addNode({
      id: `$block$${blockData.id}`,
      type: FlowNodeBaseType.BLOCK,
      originParent,
      parent,
    });
    const realBlock = document.addNode(
      {
        ...blockData,
        type: blockData.type || FlowNodeBaseType.BLOCK,
        parent: proxyBlock,
      },
      addedNodes,
    );
    addedNodes.push(proxyBlock, realBlock);
    return proxyBlock;
  },
};
