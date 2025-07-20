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
 * 基于TreeData生成：
 *
 * @param treeData  tree原始数据
 * @param options.indentDisabled  是否取消缩进。仅针对下述场景有效：异常节点+最后一个节点
 *
 * @returns
 * 1. nodes, 拉平后的node节点信息
 * 2. lines, 用于将node进行连接
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
      unindented: fatherNodeFlatten?.colNo === nodeColNo, // 未缩进
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
        // 取消缩进。 生效场景：异常节点+最后一个节点
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
