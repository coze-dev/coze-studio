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
  /** Generate a unique ID */
  const generateUniqueId = customAlphabet('1234567890', 6);
  /** Get all node IDs */
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
  /** Generate Node Replacement Map */
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
          // Add a fixed prefix here to avoid the ID starting with 0 and the backend will report an error.
          newId = `1${generateUniqueId()}`;
        } while (!isUniqueId(newId));
        nodeReplaceMap.set(id, newId);
      }
    });
    return nodeReplaceMap;
  };
  /** Does it exist? */
  const isExist = (value: unknown): boolean =>
    value !== null && value !== undefined;
  /** Does it need to be dealt with? */
  const shouldHandle = (context: TraverseContext): boolean => {
    const { node } = context;
    // line data
    if (
      node?.key &&
      ['sourceNodeID', 'targetNodeID'].includes(node.key) &&
      node.parent?.parent?.key === 'edges'
    ) {
      return true;
    }
    // node data
    if (
      node?.key === 'id' &&
      isExist(node.container?.type) &&
      isExist(node.container?.meta) &&
      isExist(node.container?.data)
    ) {
      return true;
    }
    // variable data
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
   * Replace Node ID
   * NOTICE: This method has a side effect and will modify the incoming json to prevent additional performance overhead caused by deep copies
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

/** Generate unique workflow JSON */
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
