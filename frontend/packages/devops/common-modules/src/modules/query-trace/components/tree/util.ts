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

import { omit } from 'lodash-es';

import { type TreeNodeFlatten, type TreeNode, type Line } from './typing';

/**
 * Generated based on TreeData:
 *
 * @param treeData tree original data source
 * @Param options.indentDisabled Whether to unindent. Valid only for the following scenarios: exception node + last node
 *
 * @returns
 * 1. nodes, node information after leveling
 * 2. lines, used to connect nodes
 */
export const flattenTreeData = (
  treeData: TreeNode,
  options: {
    indentDisabled: boolean;
  },
): { nodes: TreeNodeFlatten[]; lines: Line[] } => {
  const nodes: TreeNodeFlatten[] = [];
  const lines: Line[] = [];
  const walk = (
    node: TreeNode,
    nodeColNo: number,
    fatherNodeFlatten?: TreeNodeFlatten,
  ) => {
    const nodeFlatten: TreeNodeFlatten = {
      ...omit(node, ['children']),
      colNo: nodeColNo,
      rowNo: nodes.length,
      unindented: fatherNodeFlatten?.colNo === nodeColNo, // Unindented
    };
    nodes.push(nodeFlatten);
    if (fatherNodeFlatten !== undefined) {
      lines.push({
        startNode: fatherNodeFlatten,
        endNode: nodeFlatten,
      });
    }

    if (node.children) {
      const childNodes = node.children;

      childNodes.forEach((childNode, index) => {
        // Cancel indentation. Effective scene: exception node + last node
        const indentDisabled =
          childNode.indentDisabled ?? options.indentDisabled;
        if (indentDisabled && childNodes.length - 1 === index) {
          walk(childNode, nodeColNo, nodeFlatten);
        } else {
          walk(childNode, nodeColNo + 1, nodeFlatten);
        }
      });
    }
  };
  walk(treeData, 0);
  return { nodes, lines };
};
