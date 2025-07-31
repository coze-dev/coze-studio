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

import { nanoid } from 'nanoid';
import type {
  DependencyTree,
  DependencyTreeNode,
  KnowledgeInfo,
  PluginVersionInfo,
  TableInfo,
  WorkflowVersionInfo,
} from '@coze-arch/bot-api/workflow_api';

import { DependencyOrigin, NodeType } from '../typings';
import { NANO_ID_NUM } from '../constants';

export const getFrom = (project_id?: boolean, is_product?: boolean) => {
  let from = DependencyOrigin.LIBRARY;
  if (project_id) {
    from = DependencyOrigin.APP;
  }
  if (is_product) {
    from = DependencyOrigin.SHOP;
  }
  return from;
};

export const transformKnowledge = (depth: number, knowledge: KnowledgeInfo) => {
  const from = getFrom(
    Boolean(knowledge.project_id && knowledge.project_id !== '0'),
    knowledge.is_product,
  );

  return {
    id: `${knowledge.id}_${nanoid(NANO_ID_NUM)}`,
    type: 'custom',
    meta: {
      isNodeEnd: true,
    },
    data: {
      id: knowledge.id,
      name: knowledge.name,
      depth,
      collapsed: false,
      type: NodeType.KNOWLEDGE,
      from,
      version: undefined,
      icon: knowledge.icon,
    },
  };
};

export const transformTable = (depth: number, table: TableInfo) => {
  const from = getFrom(
    Boolean(table.project_id && table.project_id !== '0'),
    table.is_product,
  );

  return {
    id: `${table.id}_${nanoid(NANO_ID_NUM)}`,
    type: 'custom',
    meta: {
      isNodeEnd: true,
    },
    data: {
      id: table.id,
      name: table.name,
      depth,
      collapsed: false,
      type: NodeType.DATABASE,
      from,
      version: undefined,
      icon: table.icon,
    },
  };
};

export const transformPlugin = (depth: number, plugin: PluginVersionInfo) => {
  const from = getFrom(
    Boolean(plugin.project_id && plugin.project_id !== '0'),
    plugin.is_product,
  );
  return {
    id: `${plugin.id}_${plugin.version}`,
    type: 'custom',
    meta: {
      isNodeEnd: true,
    },
    data: {
      id: plugin.id,
      name: plugin.name,
      depth,
      collapsed: false,
      type: NodeType.PLUGIN,
      from,
      version: plugin.version,
      icon: plugin.icon,
    },
  };
};

const findNode = (
  tree: DependencyTree,
  id?: string,
): DependencyTreeNode | undefined => {
  if (!id) {
    return undefined;
  }
  const nodeList = tree.node_list || [];
  const node = nodeList.find(n => n?.id === id);
  return node;
};

/**
 * Determine whether to cycle
 */
export const isLoop = (id: string, json: DependencyTree) => {
  const node = findNode(json, id);
  // Only workflow has loops, so just focus on workflow_version
  if (node?.dependency?.workflow_version?.length) {
    return hasSameId(id, node.dependency.workflow_version, json);
  }
  return false;
};

// judgment loop
const hasSameId = (
  id: string,
  arr: WorkflowVersionInfo[],
  json: DependencyTree,
): boolean => {
  const hasSame = arr.some(n => n?.id === id);
  if (hasSame) {
    return true;
  }
  return arr.some(n => {
    const node = findNode(json, n?.id);
    return hasSameId(id, node?.dependency?.workflow_version || [], json);
  });
};
