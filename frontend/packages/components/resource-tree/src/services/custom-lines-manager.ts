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

import { inject, injectable } from 'inversify';
import {
  EntityManager,
  FlowDocument,
  type FlowNodeEntity,
  FlowNodeTransformData,
  type IPoint,
} from '@flowgram-adapter/fixed-layout-editor';

import type { CustomLine, EdgeItem } from '../typings';
import { CustomRenderStateEntity } from '../entities';
import { NODE_HEIGHT } from '../constants';
import { TreeService } from './tree-service';

const FILTER_NODE_TYPE = ['block', 'blockIcon', 'root', 'inlineBlocks'];

@injectable()
export class CustomLinesManager {
  @inject(FlowDocument) declare document: FlowDocument;

  @inject(EntityManager) declare entityManager: EntityManager;

  // Additional connection
  @inject(TreeService) declare treeService: TreeService;

  get edges(): EdgeItem[] {
    return this.treeService.edges;
  }

  get treeNodes() {
    return this.filterTreeNode(this.document.getAllNodes());
  }

  private _lines: CustomLine[] = [];

  get lines() {
    return this._lines;
  }

  set lines(lines: CustomLine[]) {
    this._lines = lines;
  }

  /**
   * Filter other non-rendering nodes
   */
  filterTreeNode(nodes: FlowNodeEntity[]) {
    return nodes.filter(
      node => !FILTER_NODE_TYPE.includes(node.flowNodeType as string),
    );
  }

  getOutputFromInput(inputPoint: IPoint) {
    return {
      x: inputPoint.x,
      y: inputPoint.y + NODE_HEIGHT,
    };
  }

  bfsAddLine(root: FlowNodeEntity): CustomLine[] {
    const queue: FlowNodeEntity[] = [root];
    const result: CustomLine[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (node.next) {
        result.push({
          from: node,
          to: node.next,
          fromPoint: this.getOutputFromInput(
            node.getData(FlowNodeTransformData)?.inputPoint,
          ),
          toPoint: node.next.getData(FlowNodeTransformData)?.inputPoint,
        });
        queue.push(node.next);
      }
      if (node.children?.length) {
        if (node.flowNodeType === 'root') {
          queue.push(node.children[0]);
        } else if (node.flowNodeType === 'split') {
          // Branch logic special handling
          const inlineBlocksChildren = node.children[1]?.children || [];
          const branchChildren =
            inlineBlocksChildren
              ?.map(c => c?.children?.[0]?.children?.[0])
              ?.filter(Boolean) || [];
          branchChildren.forEach(child => {
            result.push({
              from: node,
              to: child,
              fromPoint: this.getOutputFromInput(
                node.getData(FlowNodeTransformData)?.inputPoint,
              ),
              toPoint: child.getData(FlowNodeTransformData)?.inputPoint,
            });
          });
          queue.push(...branchChildren);
        } else {
          node.children.forEach(child => {
            result.push({
              from: node,
              to: child,
              fromPoint: this.getOutputFromInput(
                node.getData(FlowNodeTransformData)?.inputPoint,
              ),
              toPoint: child.getData(FlowNodeTransformData)?.inputPoint,
            });
          });
          queue.push(...node.children);
        }
      }
    }

    return result;
  }

  initLines() {
    if (this._lines?.length) {
      return;
    }
    this.renderLines();
  }

  renderLines() {
    // The next frame is rendered to ensure the latest line data
    requestAnimationFrame(() => {
      const lines = this.bfsAddLine(this.document.originTree.root);
      const extraLines: CustomLine[] = (this.edges || [])
        .filter(edge => {
          const from = this.entityManager.getEntityById<FlowNodeEntity>(
            edge.from,
          )!;
          const to = this.entityManager.getEntityById<FlowNodeEntity>(edge.to)!;
          return from && to && !edge.collapsed;
        })
        .map(edge => {
          const from = this.entityManager.getEntityById<FlowNodeEntity>(
            edge.from,
          )!;
          const to = this.entityManager.getEntityById<FlowNodeEntity>(edge.to)!;
          return {
            from,
            to,
            fromPoint: this.getOutputFromInput(
              from.getData(FlowNodeTransformData)?.inputPoint,
            ),
            toPoint: to.getData(FlowNodeTransformData)?.inputPoint,
          };
        });
      this._lines = [...lines, ...extraLines];
      const renderState = this.entityManager.getEntity<CustomRenderStateEntity>(
        CustomRenderStateEntity,
      );
      renderState?.updateVersion();
    });
  }
}
