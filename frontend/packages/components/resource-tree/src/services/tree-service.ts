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
    // 唯一标识符
    id: string;
    // 判断是否已经存在的两个条件
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
   * 用于检查是否有重复项
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
   * 处理 knowledge、plugin、table 的逻辑
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
    // 如果重复，判断添加线还是节点
    if (duplicate) {
      for (const [i, d] of dupDepth.entries()) {
        // 只要有一个匹配，就加线。
        // 兜底走加节点的逻辑
        if (depth + 1 === d) {
          // 存到线条中
          this.edges.push({
            from: fromId,
            to: dupId[i],
          });
          return;
        }
      }
      return newSchema;
    }
    // 否则，正常往 blocks 里添加数据
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
      // 重复节点，停止继续往下
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
        // 检测 workflow 的重复
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

  // 展开所有的子元素
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

  // 根据 edges，移动节点到另一个 TreeNode 的 children 下。
  // 需要将内部的 collapsed 全部变成 open
  cloneNode(node: TreeNode) {
    return this.dfsCloneCollapsedOpen(node);
  }

  /**
   * 绑定父元素 parent
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
   * 初始化数据，将数据从后端数据 json 变成 tree 结构
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
    // 可能因此原本设置为结束的节点现在有 child 了
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
