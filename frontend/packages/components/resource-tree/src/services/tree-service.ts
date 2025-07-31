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

/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-params */
/* eslint-disable complexity */
import { nanoid } from 'nanoid';
import { inject, injectable } from 'inversify';
import {
  FlowDocument,
  type FlowNodeJSON,
} from '@flowgram-adapter/fixed-layout-editor';
import type {
  DependencyTree,
  DependencyTreeNode,
  KnowledgeInfo,
  PluginVersionInfo,
  TableInfo,
} from '@coze-arch/bot-api/workflow_api';

import {
  transformKnowledge,
  transformPlugin,
  transformTable,
  isLoop,
} from '../utils';
import {
  DependencyOrigin,
  type EdgeItem,
  NodeType,
  type TreeNode,
} from '../typings';

@injectable()
export class TreeService {
  @inject(FlowDocument) declare document: FlowDocument;

  declare root: TreeNode;

  edges: EdgeItem[] = [];

  treeHistory: {
    // unique device identifier
    id: string;
    // To determine whether two conditions already exist
    resourceId: string;
    version?: string;
    depth: number;
  }[] = [];

  declare globalJson: DependencyTree;

  declare addChildrenArr: {
    parentId: string;
    json: FlowNodeJSON;
  }[];

  getUnCollapsedEdges() {
    return this.edges.filter(e => !e.collapsed);
  }

  /**
   * Used to check for duplicates
   */
  getNodeDuplicateFromTree = (id: string, version?: string) => {
    let duplicate = false;
    const depth: number[] = [];
    const dupId: string[] = [];
    const matchArr = this.treeHistory.filter(
      history =>
        `${history.resourceId}${history.version || ''}` ===
        `${id}${version || ''}`,
    );

    if (matchArr?.length) {
      duplicate = true;
      matchArr.forEach(item => {
        depth.push(item.depth);
        dupId.push(item.id);
      });
    }

    return {
      depth,
      duplicate,
      dupId,
    };
  };

  traverseDFS(node: TreeNode, id: string): TreeNode | undefined {
    if (node.id === id) {
      return node;
    } else {
      if (!node.children?.length) {
        return undefined;
      }
      for (const _node of node.children) {
        const findNode = this.traverseDFS(_node, id);
        if (findNode) {
          return findNode;
        }
      }
      return undefined;
    }
  }

  getNodeByIdFromTree(id: string): TreeNode | undefined {
    return this.traverseDFS(this.root, id);
  }

  /**
   * Handling knowledge, plugins, table logic
   */
  transformDuplicateInfo = (
    id: string,
    info: KnowledgeInfo | PluginVersionInfo | TableInfo,
    type: 'knowledge' | 'plugin' | 'table',
    depth: number,
    fromId: string,
  ) => {
    const {
      duplicate,
      depth: dupDepth,
      dupId,
    } = this.getNodeDuplicateFromTree(id);
    let newSchema: FlowNodeJSON;
    if (type === 'knowledge') {
      newSchema = transformKnowledge(depth + 1, info);
    } else if (type === 'plugin') {
      newSchema = transformPlugin(depth + 1, info);
    } else {
      newSchema = transformTable(depth + 1, info);
    }
    // If repeated, determine whether to add a line or a node
    if (duplicate) {
      for (const [i, d] of dupDepth.entries()) {
        // As long as there is a match, add the line.
        // The logic of adding nodes at the bottom
        if (depth + 1 === d) {
          // Save in line
          this.edges.push({
            from: fromId,
            to: dupId[i],
          });
          return;
        }
      }
      return newSchema;
    }
    // Otherwise, add data to blocks normally
    return newSchema;
  };

  dfsTransformNodeToSchema = (
    depth: number,
    node: DependencyTreeNode,
    type?: NodeType,
    parentId?: string,
  ): TreeNode | undefined => {
    if (!node?.commit_id) {
      return undefined;
    }
    let from = DependencyOrigin.APP;
    if (node.is_library) {
      from = DependencyOrigin.LIBRARY;
    }
    if (node.is_product) {
      from = DependencyOrigin.SHOP;
    }
    const dependencies = node.dependency;
    const children: TreeNode[] = [];
    const nodeId = `${node.commit_id}_${nanoid(5)}`;
    const {
      duplicate,
      depth: dupDepth,
      dupId,
    } = this.getNodeDuplicateFromTree(
      node!.id as string,
      node.workflow_version,
    );
    if (duplicate) {
      for (const [i, d] of dupDepth.entries()) {
        if (depth === d) {
          this.edges.push({
            from: parentId || '',
            to: dupId[i],
          });
          return;
        }
      }
      const loop = node.id && isLoop(node.id, this.globalJson);
      // Repeat node, stop, continue down
      const endData = {
        id: nodeId,
        type: 'custom',
        data: {
          id: node.id,
          name: node.name,
          type:
            type || (node.is_chatflow ? NodeType.CHAT_FLOW : NodeType.WORKFLOW),
          from,
          collapsed: false,
          version: node.workflow_version,
          depth,
          loop,
        },
        parent: [],
        meta: {
          isNodeEnd: true,
        },
        blocks: [],
      };
      return endData;
    }
    this.treeHistory.push({
      id: nodeId,
      resourceId: node.id as string,
      version: node.workflow_version,
      depth,
    });

    (dependencies?.knowledge_list || []).map(k => {
      const newS = this.transformDuplicateInfo(
        k.id as string,
        k,
        'knowledge',
        depth,
        nodeId,
      );
      if (newS) {
        this.treeHistory.push({
          id: newS.id,
          resourceId: newS.data?.id,
          version: newS.data?.version,
          depth: newS.data?.depth,
        });
        children.push({
          ...newS,
          data: newS.data || {},
          type: newS.type as string,
          parent: [],
          children: [],
        });
      }
    });
    (dependencies?.table_list || []).map(t => {
      const newS = this.transformDuplicateInfo(
        t.id as string,
        t,
        'table',
        depth,
        nodeId,
      );
      if (newS) {
        this.treeHistory.push({
          id: newS.id,
          resourceId: newS.data?.id,
          version: newS.data?.version,
          depth: newS.data?.depth,
        });
        children.push({
          ...newS,
          data: newS.data || {},
          type: newS.type as string,
          parent: [],
          children: [],
        });
      }
    });
    (dependencies?.plugin_version || []).map(p => {
      const newS = this.transformDuplicateInfo(
        p.id as string,
        p,
        'plugin',
        depth,
        nodeId,
      );
      if (newS) {
        this.treeHistory.push({
          id: newS.id,
          resourceId: newS.data?.id,
          version: newS.data?.version,
          depth: newS.data?.depth,
        });
        children.push({
          ...newS,
          data: newS.data || {},
          type: newS.type as string,
          parent: [],
          children: [],
        });
      }
    });
    (dependencies?.workflow_version?.filter(v => v.id !== node.id) || []).map(
      w => {
        const workflowInfo = this.globalJson.node_list?.find(
          _node => _node.id === w.id && _node.workflow_version === w.version,
        );
        const subWorkflowSchema = this.dfsTransformNodeToSchema(
          depth + 1,
          workflowInfo!,
          undefined,
          nodeId,
        );
        // Detect duplication of workflow
        if (subWorkflowSchema) {
          this.treeHistory.push({
            id: subWorkflowSchema.id,
            resourceId: subWorkflowSchema.data?.id || '',
            version: subWorkflowSchema.data?.version,
            depth: subWorkflowSchema?.data?.depth,
          });
          children.push(subWorkflowSchema);
        }
      },
    );
    const isNodeEnd = !children.length;
    return {
      id: nodeId,
      type: isNodeEnd ? 'custom' : 'split',
      parent: [],
      data: {
        id: node.id,
        name: node.name,
        type:
          type || (node.is_chatflow ? NodeType.CHAT_FLOW : NodeType.WORKFLOW),
        from,
        collapsed: false,
        version: node.workflow_version,
        depth,
      },
      ...(isNodeEnd
        ? {
            meta: {
              isNodeEnd: true,
            },
          }
        : {}),
      children,
    };
  };

  // Expand all child elements
  dfsCloneCollapsedOpen(node: TreeNode): TreeNode {
    const children = node.children?.map(c => this.dfsCloneCollapsedOpen(c));
    return {
      ...node,
      data: {
        ...node.data,
        collapsed: false,
      },
      children,
    };
  }

  // According to edges, move the node to the children of another TreeNode.
  // It needs to be collapsed and opened
  cloneNode(node: TreeNode) {
    return this.dfsCloneCollapsedOpen(node);
  }

  /**
   * Bind parent element parent
   */
  bindTreeParent(node: TreeNode, parent?: TreeNode) {
    if (parent) {
      node.parent.push(parent);
    }
    this.edges.forEach(edge => {
      if (edge.to === node.id) {
        const fromNode = this.getNodeByIdFromTree(edge.from);
        if (fromNode) {
          node.parent.push(fromNode);
        }
      }
    });
    node.children?.forEach(item => {
      this.bindTreeParent(item, node);
    });
  }

  /**
   * Initialize the data and turn the data from the back-end data json into a tree structure
   */
  transformSchema(json: DependencyTree) {
    this.globalJson = json;
    const { node_list = [] } = json;
    const rootWorkflow = node_list.find(node => node.is_root);
    if (!rootWorkflow) {
      return undefined;
    }
    const root = this.dfsTransformNodeToSchema(0, rootWorkflow);
    if (root) {
      this.root = root;
      // this.bindTreeParent(root);
    }
  }

  dfsTreeJson(node: TreeNode): FlowNodeJSON {
    let blocks: FlowNodeJSON[] = [];
    const lines = this.getUnCollapsedEdges();
    node?.children?.forEach(c => {
      const connectLines = lines.filter(l => l.to === c.id);
      if (c.data?.collapsed && connectLines?.length) {
        const cloneNode = this.cloneNode(c);
        connectLines.forEach(l => {
          this.addChildrenArr.push({
            parentId: l.from,
            json: this.dfsTreeJson(cloneNode),
          });
        });
      }
    });
    if (node?.children?.length) {
      blocks = node.children
        .filter(c => !c?.data?.collapsed)
        .map(c => ({
          id: `${c.id}_block`,
          type: 'block',
          blocks: [this.dfsTreeJson(c)],
        }));
    }
    return {
      id: node?.id,
      type: node?.type,
      data: node?.data,
      meta: node?.meta,
      blocks,
    };
  }

  addNode(
    json: FlowNodeJSON,
    addItem: {
      parentId: string;
      json: FlowNodeJSON;
    },
  ) {
    if (json.id === addItem.parentId) {
      const blockItem = {
        id: `${addItem.json.id}_block`,
        type: 'block',
        blocks: [addItem.json],
      };
      if (json.blocks) {
        json.blocks.push(blockItem);
      } else {
        json.blocks = [blockItem];
      }
    } else {
      json.blocks?.forEach(block => {
        this.addNode(block, addItem);
      });
    }
    // Perhaps because of this, the node that was originally set to end now has children
    if (json.blocks?.length) {
      if (json.type === 'custom') {
        json.type = 'split';
      }
      if (json.meta) {
        json.meta.isNodeEnd = false;
      } else {
        json.meta = {
          isNodeEnd: true,
        };
      }
    }
  }

  treeToFlowNodeJson() {
    this.addChildrenArr = [];
    const rootNodeJson = this.dfsTreeJson(this.root);
    if (!rootNodeJson || !rootNodeJson?.id) {
      const json = {
        nodes: [],
      };
      this.document.fromJSON(json);
      return json;
    }

    const json2 = {
      nodes: [rootNodeJson],
    };

    this.addChildrenArr.forEach(item => {
      this.addNode(rootNodeJson, item);
    });

    this.document.fromJSON(json2);
    return json2;
  }
}
