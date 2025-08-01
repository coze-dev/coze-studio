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
  Emitter,
  EntityManager,
  FlowDocument,
  type IPoint,
  type PositionSchema,
  type FlowNodeEntity,
} from '@flowgram-adapter/fixed-layout-editor';

import {
  getLineId,
  getNodeIdFromTreeId,
  getTreeIdFromNodeId,
  calcDistance,
} from '../utils';
import { type CustomLine, type EdgeItem } from '../typings';
import { CustomRenderStateConfigEntity } from '../entities';
import { LINE_HOVER_DISTANCE } from '../constants';
import { TreeService } from './tree-service';
import { CustomLinesManager } from './custom-lines-manager';

@injectable()
export class CustomHoverService {
  @inject(CustomLinesManager) declare linesManager: CustomLinesManager;

  @inject(FlowDocument) declare document: FlowDocument;

  @inject(TreeService) declare treeService: TreeService;

  @inject(EntityManager) declare entityManager: EntityManager;

  @inject(CustomRenderStateConfigEntity)
  declare renderStateEntity: CustomRenderStateConfigEntity;

  get edges(): EdgeItem[] {
    return this.treeService.getUnCollapsedEdges();
  }

  private onBackgroundClickEmitter = new Emitter<void>();

  onBackgroundClick = this.onBackgroundClickEmitter.event;

  private onHoverCollapseEmitter = new Emitter<FlowNodeEntity | undefined>();

  onHoverCollapse = this.onHoverCollapseEmitter.event;

  private onHoverLineEmitter = new Emitter<CustomLine | undefined>();

  onHoverLine = this.onHoverLineEmitter.event;

  private onSelectNodeEmitter = new Emitter<void>();

  onSelectNode = this.onSelectNodeEmitter.event;

  private _hoveredLine: CustomLine | undefined;

  get hoveredLine() {
    return this._hoveredLine;
  }

  /**
   * Calculate and line spacing based on mouse position
   */
  getCloseInLineFromMousePos(
    mousePos: IPoint,
    minDistance: number = LINE_HOVER_DISTANCE,
  ): CustomLine | undefined {
    let targetLine: CustomLine | undefined, targetLineDist: number | undefined;
    (this.linesManager?.lines || []).forEach(line => {
      const dist = calcDistance(mousePos, line);

      if (dist <= minDistance && (!targetLineDist || targetLineDist >= dist)) {
        targetLineDist = dist;
        targetLine = line;
      }
    });
    return targetLine;
  }

  updateHoverLine(pos: PositionSchema, checkTarget: boolean) {
    if (!checkTarget) {
      this.onHoverLineEmitter.fire(undefined);
    }
    const hoverLine = this.getCloseInLineFromMousePos(pos);
    if (hoverLine) {
      this.onHoverLineEmitter.fire(hoverLine);
      this._hoveredLine = hoverLine;
    } else {
      this.onHoverLineEmitter.fire(undefined);
      this._hoveredLine = undefined;
    }
    return hoverLine;
  }

  backgroundClick(updateLines = true) {
    this.onBackgroundClickEmitter.fire();
    this.renderStateEntity.setSelectNodes([]);
    this.renderStateEntity.setActivatedNode(undefined);
    if (this.hoveredLine) {
      const lineId = getLineId(this._hoveredLine);
      this.renderStateEntity.activeLines = [lineId!];
    } else if (updateLines) {
      this.renderStateEntity.activeLines = [];
    } else {
      this.renderStateEntity.activeLines = [];
    }
  }

  // Collapse strategy: access all connected elements and access their parent elements simultaneously, performing collapse.
  hoverCollapse(from?: FlowNodeEntity) {
    this.onHoverCollapseEmitter.fire(from);
  }

  getParent(node?: FlowNodeEntity): FlowNodeEntity | undefined {
    if (!node) {
      return node;
    }
    if (node.flowNodeType !== 'blockIcon') {
      return this.getParent(node.parent);
    } else {
      return node;
    }
  }

  selectNode(node: FlowNodeEntity) {
    const selectNodes = this.getRelatedNodes(node);
    this.renderStateEntity.setSelectNodes(selectNodes);
    this.renderStateEntity.setActivatedNode(node);
    // Highlight all relevant lines
    const activeLines: string[] = [];
    this.linesManager.lines.map(line => {
      const fromInclude = selectNodes.includes(line.from.id);
      const toInclude = selectNodes.includes(line.to.id);
      if (fromInclude && toInclude) {
        activeLines.push(getLineId(line)!);
      }
    });
    this.renderStateEntity.activeLines = activeLines;
    this.linesManager.renderLines();
  }

  traverseAncestors = (node: FlowNodeEntity): string[] => {
    let ancArr: string[] = [];
    if (node.parent) {
      const arr = this.traverseAncestors(node.parent);
      ancArr = ancArr.concat(arr);
    }
    this.edges.forEach(edge => {
      if (edge.to === getTreeIdFromNodeId(node.id)) {
        // Push extra lines
        ancArr.push(edge.from);
        // Traverse the previous node information
        const fromNode = this.document.getNode(getNodeIdFromTreeId(edge.from));
        if (fromNode) {
          const arr = this.traverseAncestors(fromNode);
          ancArr.concat(arr);
        }
      }
    });
    ancArr.push(node.id);
    return ancArr;
  };

  traverseDescendants = (node: FlowNodeEntity): string[] => {
    let ancArr: string[] = [];
    if (node.children?.length) {
      node.children?.forEach(child => {
        ancArr.push(child.id);
        const childArr = this.traverseDescendants(child);
        ancArr = ancArr.concat(childArr);
      });
    }
    if (node.next) {
      const childArr = this.traverseDescendants(node.next);
      ancArr = ancArr.concat(childArr);
    }
    return ancArr;
  };

  /**
   * According to the current tree structure, iterate through the nodes and select
   */
  getRelatedNodes = (node: FlowNodeEntity) => {
    const parentRelated = this.traverseAncestors(node);
    const childRelated = this.traverseDescendants(node);
    return [...parentRelated, ...childRelated];
  };
}
