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
 
/* eslint-disable complexity -- no need to fix */
/* eslint-disable @typescript-eslint/no-namespace -- no need to fix */
import { customAlphabet } from 'nanoid';
import { traverse, type TraverseContext } from '@coze-workflow/base';

import type { WorkflowClipboardJSON, WorkflowClipboardNodeJSON } from '../type';

namespace UniqueWorkflowUtils {
  /** 生成唯一ID */
  const generateUniqueId = customAlphabet('1234567890', 6);
  /** 获取所有节点ID */
  export const getAllNodeIds = (json: WorkflowClipboardJSON): string[] => {
    const nodeIds = new Set<string>();
    const addNodeId = (node: WorkflowClipboardNodeJSON) => {
      nodeIds.add(node.id);
      if (node.blocks?.length) {
        node.blocks.forEach(child => addNodeId(child));
      }
    };
    json.nodes.forEach(node => addNodeId(node));
    return Array.from(nodeIds);
  };
  /** 生成节点替换映射 */
  export const generateNodeReplaceMap = (
    nodeIds: string[],
    isUniqueId: (id: string) => boolean,
  ): Map<string, string> => {
    const nodeReplaceMap = new Map<string, string>();
    nodeIds.forEach(id => {
      if (isUniqueId(id)) {
        nodeReplaceMap.set(id, id);
      } else {
        let newId: string;
        do {
          // 这里添加一个固定前缀，避免 ID 以 0 开头，后端会报错
          newId = `1${generateUniqueId()}`;
        } while (!isUniqueId(newId));
        nodeReplaceMap.set(id, newId);
      }
    });
    return nodeReplaceMap;
  };
  /** 是否存在 */
  const isExist = (value: unknown): boolean =>
    value !== null && value !== undefined;
  /** 是否需要处理 */
  const shouldHandle = (context: TraverseContext): boolean => {
    const { node } = context;
    // 线条数据
    if (
      node?.key &&
      ['sourceNodeID', 'targetNodeID'].includes(node.key) &&
      node.parent?.parent?.key === 'edges'
    ) {
      return true;
    }
    // 节点数据
    if (
      node?.key === 'id' &&
      isExist(node.container?.type) &&
      isExist(node.container?.meta) &&
      isExist(node.container?.data)
    ) {
      return true;
    }
    // 变量数据
    if (
      node?.key === 'blockID' &&
      isExist(node.container?.name) &&
      node.container?.source === 'block-output'
    ) {
      return true;
    }
    return false;
  };
  /**
   * 替换节点ID
   * NOTICE: 该方法有副作用，会修改传入的json，防止深拷贝造成额外性能开销
   */
  export const replaceNodeId = (
    json: WorkflowClipboardJSON,
    nodeReplaceMap: Map<string, string>,
  ): WorkflowClipboardJSON => {
    traverse(json, context => {
      if (!shouldHandle(context)) {
        return;
      }
      const { node } = context;
      if (nodeReplaceMap.has(node.value)) {
        context.setValue(nodeReplaceMap.get(node.value));
      }
    });
    return json;
  };
}

/** 生成唯一工作流JSON */
export const generateUniqueWorkflow = (params: {
  json: WorkflowClipboardJSON;
  isUniqueId: (id: string) => boolean;
}): WorkflowClipboardJSON => {
  const { json, isUniqueId } = params;
  const nodeIds = UniqueWorkflowUtils.getAllNodeIds(json);
  const nodeReplaceMap = UniqueWorkflowUtils.generateNodeReplaceMap(
    nodeIds,
    isUniqueId,
  );
  return UniqueWorkflowUtils.replaceNodeId(json, nodeReplaceMap);
};
