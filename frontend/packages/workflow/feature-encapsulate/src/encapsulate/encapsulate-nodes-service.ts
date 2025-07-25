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
 
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { get, set } from 'lodash-es';
import { inject, injectable } from 'inversify';
import {
  type DragNodeOperationValue,
  FreeOperationType,
  HistoryService,
} from '@flowgram-adapter/free-layout-editor';
import {
  PlaygroundContext,
  TransformData,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeJSON,
  type WorkflowNodeEntity,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import { delay, type IPoint } from '@flowgram-adapter/common';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base/types';

import { getNodesParentId } from '../utils/get-nodes-parent-id';
import { getNodePoint } from '../utils';
import { EncapsulateGenerateService } from '../generate';
import { EncapsulateContext } from '../encapsulate-context';
import { ENCAPSULATE_START_END_PAD } from './constants';

/**
 * 节点操作服务
 */
@injectable()
export class EncapsulateNodesService {
  @inject(WorkflowDocument)
  private workflowDocument: WorkflowDocument;

  @inject(WorkflowNodesService)
  private workflowNodesService: WorkflowNodesService;

  @inject(EncapsulateContext)
  private encapsulateContext: EncapsulateContext;

  @inject(EncapsulateGenerateService)
  private encapsulateGenerateService: EncapsulateGenerateService;

  @inject(HistoryService)
  private historyService: HistoryService;

  @inject(PlaygroundContext)
  private playgroundContext: PlaygroundContext;

  /**
   * 获取一批节点的中心点
   * @param nodes 节点数组
   * @returns 中心点的坐标对象
   */
  getNodesMiddlePoint(
    nodes: Array<WorkflowNodeEntity | WorkflowNodeJSON>,
  ): IPoint {
    if (nodes.length === 0) {
      throw new Error('选中节点不能为空');
    }

    const rect = this.getNodesRect(nodes);

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
  }

  /**
   * 创建解封节点
   * @param sourceNode 原始被解封的节点
   * @param nodes 要生成节点的node json数据
   * @returns
   */
  async createDecapsulateNodes(
    sourceNode: WorkflowNodeEntity,
    nodes: WorkflowNodeJSON[],
    parentId?: string,
  ) {
    const { startNode, endNode, middleNodes } = this.groupNodes(nodes);
    if (!startNode || !endNode) {
      throw new Error('start or end node not found');
    }
    const nodePoint = getNodePoint(sourceNode);
    const centerPoint = this.getNodesMiddlePoint(middleNodes);
    // 平移到中心
    const translate: IPoint = {
      x: nodePoint.x - centerPoint.x,
      y: nodePoint.y - centerPoint.y,
    };

    const idsMap = new Map<string, string>();
    for (const nodeJSON of middleNodes) {
      await this.createDecapsulateNode(nodeJSON, translate, idsMap, parentId);
    }

    return {
      idsMap,
      startNode,
      endNode,
      middleNodes,
    };
  }

  /**
   * 创建封装节点
   * @param name
   * @param nodes
   * @returns
   */
  async createEncapsulateNode(
    workflowId: string,
    name: string,
    nodes: WorkflowNodeEntity[],
  ) {
    const pos = this.getNodesMiddlePoint(nodes);
    const type = StandardNodeType.SubWorkflow;
    const nodeJSON = this.encapsulateGenerateService.generateSubWorkflowNode({
      spaceId: this.encapsulateContext.spaceId,
      workflowId,
      name,
      desc: name,
    });
    await this.beforeCreate(type, nodeJSON);
    const subFlowNode = await this.workflowDocument.createWorkflowNodeByType(
      type,
      pos,
      nodeJSON,
      getNodesParentId(nodes),
    );
    return subFlowNode;
  }

  /**
   * 通过json创建一个新节点
   * @param json
   * @returns
   */
  async createDecapsulateNode(
    nodeJSON: WorkflowNodeJSON,
    translate: IPoint,
    idsMap?: Map<string, string>,
    parentId?: string,
  ) {
    const json = this.getDecapsulateNodeJSON(nodeJSON, translate, idsMap);
    await this.beforeCreate(json.type as StandardNodeType, json);
    const newNode = await this.workflowDocument.createWorkflowNode(
      json,
      true,
      parentId || 'root',
    );
    return newNode;
  }

  /**
   * 解封布局，将所有节点向外平移一半的宽高
   */
  decapsulateLayout(sourceNode: WorkflowNodeEntity, nodes: WorkflowNodeJSON[]) {
    const point = getNodePoint(sourceNode);
    const { width, height } = this.getNodesRect(
      nodes.filter(
        n =>
          ![StandardNodeType.Start, StandardNodeType.End].includes(
            n.type as StandardNodeType,
          ),
      ),
    );

    const value: DragNodeOperationValue = {
      ids: [],
      value: [],
      oldValue: [],
    };

    this.workflowDocument.getAllNodes().reduce((previousValue, node) => {
      const nodePoint = getNodePoint(node);

      if (nodePoint.x > point.x) {
        nodePoint.x += width / 2;
      }

      if (nodePoint.y > point.y) {
        nodePoint.y += height / 2;
      }

      if (nodePoint.x < point.x) {
        nodePoint.x -= width / 2;
      }

      if (nodePoint.y < point.y) {
        nodePoint.y -= height / 2;
      }

      const transformData = node.getData<TransformData>(TransformData);
      previousValue.ids.push(node.id);
      previousValue.value.push(nodePoint);
      previousValue.oldValue.push({
        x: transformData.position.x,
        y: transformData.position.y,
      });
      return previousValue;
    }, value);

    this.historyService.pushOperation({
      type: FreeOperationType.dragNodes,
      value,
    });
  }

  /**
   * 获取解封后的节点JSON
   * @param nodeJSON 原来的node json
   * @param translate 平移的距离
   * @param idsMap ids映射
   * @returns
   */
  private getDecapsulateNodeJSON(
    nodeJSON: WorkflowNodeJSON,
    translate: IPoint,
    idsMap?: Map<string, string>,
  ): WorkflowNodeJSON {
    const id = this.workflowNodesService.createUniqID();

    if (idsMap) {
      idsMap.set(nodeJSON.id, id);
    }

    nodeJSON.id = id;
    const title = get(nodeJSON, 'data.nodeMeta.title') || nodeJSON.type;
    const uniqueTitle = this.workflowNodesService.createUniqTitle(title);
    set(nodeJSON, 'data.nodeMeta.title', uniqueTitle);

    if (!nodeJSON.meta) {
      nodeJSON.meta = {};
    }

    nodeJSON.meta.position = this.getDecapsulatePosition(nodeJSON, translate);

    if (nodeJSON.blocks) {
      nodeJSON.blocks = nodeJSON.blocks.map(block =>
        this.getDecapsulateNodeJSON(block, translate, idsMap),
      );
    }
    return nodeJSON;
  }

  /**
   * 获取解封后的节点坐标
   * @param nodeJSON
   * @param translate
   * @returns
   */
  private getDecapsulatePosition(
    nodeJSON: WorkflowNodeJSON,
    translate: IPoint,
  ) {
    const position = nodeJSON.meta?.position || {
      x: 0,
      y: 0,
    };
    return {
      x: position.x + translate.x,
      y: position.y + translate.y,
    };
  }

  /**
   * 节点分组
   * @param nodes
   * @returns
   */
  private groupNodes(nodes: WorkflowNodeJSON[]) {
    const middleNodes: WorkflowNodeJSON[] = [];
    let startNode: WorkflowNodeJSON | undefined;
    let endNode: WorkflowNodeJSON | undefined;
    nodes.forEach(node => {
      if (node.type === StandardNodeType.Start) {
        startNode = node;
      } else if (node.type === StandardNodeType.End) {
        endNode = node;
      } else {
        middleNodes.push(node);
      }
    });

    return {
      startNode,
      endNode,
      middleNodes,
    };
  }

  /**
   * 获取多个节点合起来的宽高
   * @param nodes
   * @returns
   */
  private getNodesRect(nodes: Array<WorkflowNodeEntity | WorkflowNodeJSON>) {
    const x1 = Math.min(...nodes.map(node => getNodePoint(node).x));
    const x2 = Math.max(...nodes.map(node => getNodePoint(node).x));
    const y1 = Math.min(...nodes.map(node => getNodePoint(node).y));
    const y2 = Math.max(...nodes.map(node => getNodePoint(node).y));

    const width = x2 - x1;
    const height = y2 - y1;

    return {
      width,
      height,
      x: x1,
      y: y1,
    };
  }

  getEncapsulateStartEndRects(nodes: WorkflowNodeEntity[]) {
    const boundaryNodes = this.getBoundaryNodes(nodes);

    if (!boundaryNodes.left || !boundaryNodes.right) {
      throw new Error('boundaryNodes left or right node not found');
    }

    return {
      start: this.getEncapsulateStartEndRect(
        StandardNodeType.Start,
        boundaryNodes.left,
      ),
      end: this.getEncapsulateStartEndRect(
        StandardNodeType.End,
        boundaryNodes.right,
      ),
    };
  }

  /**
   * 删除节点
   * @param node   */
  async deleteNodes(nodes: WorkflowNodeEntity[]) {
    nodes.forEach(node => {
      node.dispose();
    });
    // 有些节点删除会有删除出相关连线，等待其执行完成
    await delay(10);
  }

  private async beforeCreate(
    nodeType: string,
    nodeJSON: Partial<WorkflowNodeJSON>,
  ) {
    if (!nodeType) {
      return;
    }

    const nodeRegistry = this.workflowDocument.getNodeRegister(nodeType);

    await nodeRegistry?.onInit?.(
      nodeJSON as WorkflowNodeJSON,
      this.playgroundContext,
    );
  }

  private getEncapsulateStartEndRect(
    type: StandardNodeType.Start | StandardNodeType.End,
    boundaryNode: WorkflowNodeEntity,
  ) {
    const node = this.workflowDocument
      .getAllNodes()
      .find(item => item.flowNodeType === type);

    if (!node) {
      throw new Error('getEncapsulateStartEndPoint node not found');
    }

    const nodeReact = this.getNodeRect(node);
    const boundaryNodeReact = this.getNodeRect(boundaryNode);

    const translateX =
      type === StandardNodeType.Start
        ? -ENCAPSULATE_START_END_PAD - nodeReact.width
        : ENCAPSULATE_START_END_PAD + boundaryNodeReact.width;
    const translateY = (boundaryNodeReact.height - nodeReact.height) / 2;

    return {
      x: boundaryNodeReact.x + translateX,
      y: boundaryNodeReact.y + translateY,
      width: nodeReact.width,
      height: nodeReact.height,
    };
  }

  private getNodeRect(node: WorkflowNodeEntity) {
    const transformData = node.getData<TransformData>(TransformData);
    return {
      x: transformData.bounds.left,
      y: transformData.bounds.top,
      width: transformData.bounds.width,
      height: transformData.bounds.height,
    };
  }

  private getBoundaryNodes(nodes: WorkflowNodeEntity[]) {
    const boundaryNodes: {
      left?: WorkflowNodeEntity;
      right?: WorkflowNodeEntity;
    } = {};

    nodes.reduce((previousValue, node) => {
      if (!previousValue.left) {
        previousValue.left = node;
      }

      if (!previousValue.right) {
        previousValue.right = node;
      }

      if (getNodePoint(node).x < getNodePoint(previousValue.left).x) {
        previousValue.left = node;
      }

      if (getNodePoint(node).x > getNodePoint(previousValue.right).x) {
        previousValue.right = node;
      }

      return previousValue;
    }, boundaryNodes);

    return boundaryNodes;
  }
}
