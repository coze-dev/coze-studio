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
  FlowNodeBaseType,
  FlowNodeTransformData,
} from '@flowgram-adapter/free-layout-editor';
import { EntityManager } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowCommands,
  WorkflowDocument,
  type WorkflowEdgeJSON,
  WorkflowHoverService,
  type WorkflowLineEntity,
  type WorkflowLinePortInfo,
  WorkflowLinesManager,
  WorkflowNodeEntity,
  type WorkflowNodeMeta,
  WorkflowSelectService,
  type WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';
import {
  delay,
  type IPoint,
  type PositionSchema,
  Rectangle,
} from '@flowgram-adapter/common';
import {
  type WorkflowShortcutsContribution,
  type WorkflowShortcutsRegistry,
} from '@coze-workflow/render';
import { type WorkflowNodeJSON } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { WorkflowGlobalStateEntity } from '@/typing';
import {
  WorkflowCustomDragService,
  WorkflowEditService,
  WorkflowSaveService,
} from '@/services';

import { generateUniqueWorkflow } from '../../utils/unique-workflow';
import { safeFn } from '../../utils';
import type {
  WorkflowClipboardData,
  WorkflowClipboardJSON,
  WorkflowClipboardNodeJSON,
  WorkflowClipboardRect,
  WorkflowClipboardSource,
} from '../../type';
import { isValidNode } from './is-valid-node';
import { isValidData } from './is-valid-data';

/**
 * Paste shortcut
 */
@injectable()
export class WorkflowPasteShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(EntityManager) private entityManager: EntityManager;
  @inject(WorkflowLinesManager) private linesManager: WorkflowLinesManager;
  @inject(WorkflowDocument) private document: WorkflowDocument;
  @inject(WorkflowHoverService) private hoverService: WorkflowHoverService;
  @inject(WorkflowCustomDragService)
  private dragService: WorkflowCustomDragService;
  @inject(WorkflowSelectService) private selection: WorkflowSelectService;
  @inject(WorkflowEditService) private editService: WorkflowEditService;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowSaveService) private saveService: WorkflowSaveService;

  /** Registration shortcut */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowCommands.PASTE_NODES,
      shortcuts: ['meta v', 'ctrl v'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  /** render */
  public async render(params: {
    json: WorkflowClipboardJSON;
    source: WorkflowClipboardSource;
    titleCache?: string[];
    offset?: IPoint;
    parent?: WorkflowNodeEntity;
    toContainer?: WorkflowNodeEntity;
  }): Promise<WorkflowNodeEntity[]> {
    const {
      json,
      source,
      titleCache = [],
      offset = { x: 0, y: 0 },
      parent,
      toContainer,
    } = params;
    const nodes: WorkflowNodeEntity[] = await this.createNodes({
      json: json.nodes,
      source,
      titleCache,
      offset,
      parent,
      toContainer,
    });
    await this.nextTick(); // Waiting for node rendering and dynamic port rendering
    this.createLines({
      json: json.edges,
      parent,
    });
    return nodes;
  }
  /** Handling replication events */
  private async handle(
    _event: KeyboardEvent,
  ): Promise<WorkflowNodeEntity[] | undefined> {
    const data = await this.tryReadClipboard();
    if (!data) {
      return;
    }
    if (!isValidData({ data, globalState: this.globalState })) {
      return;
    }
    const nodes = await this.apply(data);
    if (nodes.length > 0) {
      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
      });
      // Scroll to viewable area
      this.scrollToNodes(nodes);
    }
    return nodes;
  }
  /** Try reading the clipboard */
  private async tryReadClipboard(): Promise<WorkflowClipboardData | undefined> {
    try {
      // The user is required to grant the webpage clipboard read permission. If the user does not grant permission, the code may throw an exception NotAllowedError.
      const text: string = (await navigator.clipboard.readText()) || '';
      const clipboardData: WorkflowClipboardData = JSON.parse(text);
      return clipboardData;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need report error
    } catch (e) {
      // The data in the clipboard itself is not fixed, so there is no need to report an error.
      return;
    }
  }
  /** Apply clipboard data */
  private async apply(
    data: WorkflowClipboardData,
  ): Promise<WorkflowNodeEntity[]> {
    const { source, json: rawJSON } = data;
    const json = generateUniqueWorkflow({
      json: rawJSON,
      isUniqueId: (id: string) => !this.entityManager.getEntityById(id),
    });

    // You need to initialize the node data before rebuilding the node
    await this.saveService.initNodeData(json.nodes as WorkflowNodeJSON[]);

    const titleCache: string[] = [];
    const offset = this.calcPasteOffset(data.bounds);
    const container = this.getSelectedContainer();
    const nodes = await this.render({
      json,
      source,
      titleCache,
      offset,
      parent: container,
      toContainer: container,
    });
    this.selectNodes(nodes);
    return nodes;
  }
  /** Calculate Paste Offset */
  private calcPasteOffset(boundsData: WorkflowClipboardRect): IPoint {
    const { x, y, width, height } = boundsData;
    const rect = new Rectangle(x, y, width, height);
    const { center } = rect;
    const mousePos = this.hoverService.hoveredPos;
    return {
      x: mousePos.x - center.x,
      y: mousePos.y - center.y,
    };
  }
  /** Create Node */
  private async createNodes(params: {
    json: WorkflowClipboardNodeJSON[];
    source: WorkflowClipboardSource;
    titleCache: string[];
    offset: IPoint;
    parent?: WorkflowNodeEntity;
    toContainer?: WorkflowNodeEntity;
  }): Promise<WorkflowNodeEntity[]> {
    const { json, source, titleCache, offset, parent, toContainer } = params;
    const nodes: WorkflowNodeEntity[] = [];
    await Promise.all(
      json
        .map(async (rawNodeJSON: WorkflowClipboardNodeJSON) => {
          const { blocks, edges, ...nodeJSON } = rawNodeJSON;
          const node = await this.createNode({
            nodeJSON,
            source,
            titleCache,
            offset,
            parent,
            toContainer,
          });
          if (!node) {
            return;
          }
          const subCanvas = this.getNodeSubCanvas(node);
          if (subCanvas) {
            nodes.push(subCanvas.canvasNode);
          }
          if (blocks?.length) {
            const container = this.getNodeSubCanvas(node)?.canvasNode ?? node;
            this.render({
              json: {
                nodes: blocks,
                edges: edges ?? [],
              },
              source,
              titleCache,
              offset,
              parent: container,
            });
          }
          nodes.push(node);
        })
        .filter(Boolean),
    );
    return nodes;
  }
  /** Get node child canvas information */
  private getNodeSubCanvas(
    node: WorkflowNodeEntity,
  ): WorkflowSubCanvas | undefined {
    if (!node) {
      return;
    }
    const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
    const subCanvas = nodeMeta.subCanvas?.(node);
    return subCanvas;
  }
  /** Create Node */
  private async createNode(params: {
    nodeJSON: WorkflowClipboardNodeJSON;
    source: WorkflowClipboardSource;
    titleCache: string[];
    offset: IPoint;
    parent?: WorkflowNodeEntity;
    toContainer?: WorkflowNodeEntity;
  }): Promise<WorkflowNodeEntity | undefined> {
    const { nodeJSON, source, titleCache, offset, parent, toContainer } =
      params;
    if (
      !isValidNode({
        node: nodeJSON,
        parent,
        source,
        globalState: this.globalState,
        dragService: this.dragService,
      })
    ) {
      return;
    }
    // Generate unique node titles
    const processedNodeJSON = this.editService.recreateNodeJSON(
      nodeJSON,
      titleCache,
      false,
    );
    if (processedNodeJSON.meta?.canvasPosition) {
      processedNodeJSON.meta.canvasPosition = {
        x: processedNodeJSON.meta.canvasPosition.x + offset.x,
        y: processedNodeJSON.meta.canvasPosition.y + offset.y,
      };
    }
    const nodePosition = this.calcNodePosition({
      nodeJSON,
      offset,
      parent,
      toContainer,
    });
    const node = await this.document.copyNodeFromJSON(
      nodeJSON.type as string,
      processedNodeJSON,
      nodeJSON.id,
      nodePosition,
      parent?.id,
    );
    return node;
  }
  /** Create a connection */
  private createLines(params: {
    json: WorkflowEdgeJSON[];
    parent?: WorkflowNodeEntity;
  }): WorkflowLineEntity[] {
    const { json, parent } = params;
    return json
      .map(edgeJSON => this.createLine({ edgeJSON, parent }))
      .filter(Boolean) as WorkflowLineEntity[];
  }
  /** Create a connection */
  private createLine(params: {
    edgeJSON: WorkflowEdgeJSON;
    parent?: WorkflowNodeEntity;
  }): WorkflowLineEntity | undefined {
    const { edgeJSON, parent } = params;
    const fromNode = this.entityManager.getEntityById<WorkflowNodeEntity>(
      edgeJSON.sourceNodeID,
    );
    const toNode = this.entityManager.getEntityById<WorkflowNodeEntity>(
      edgeJSON.targetNodeID,
    );
    if (!fromNode || !toNode) {
      return;
    }
    const lineInfo: WorkflowLinePortInfo = {
      from: edgeJSON.sourceNodeID,
      fromPort: edgeJSON.sourcePortID,
      to: edgeJSON.targetNodeID,
      toPort: edgeJSON.targetPortID,
    };
    if (!parent) {
      return this.linesManager.createLine(lineInfo);
    }
    // To connect between parent and child nodes, you need to replace the parent node with the child canvas
    const parentSubCanvas = this.getNodeSubCanvas(parent);
    if (!parentSubCanvas) {
      return this.linesManager.createLine(lineInfo);
    }
    if (lineInfo.from === parentSubCanvas.parentNode.id) {
      return this.linesManager.createLine({
        ...lineInfo,
        from: parentSubCanvas.canvasNode.id,
      });
    }
    if (lineInfo.to === parentSubCanvas.parentNode.id) {
      return this.linesManager.createLine({
        ...lineInfo,
        to: parentSubCanvas.canvasNode.id,
      });
    }
    return this.linesManager.createLine(lineInfo);
  }
  /** Calculate node location */
  private calcNodePosition(params: {
    nodeJSON: WorkflowClipboardNodeJSON;
    parent?: WorkflowNodeEntity;
    offset: IPoint;
    toContainer?: WorkflowNodeEntity;
  }): PositionSchema {
    const { nodeJSON, parent, offset, toContainer } = params;

    if (!nodeJSON.meta?.position) {
      return this.hoverService.hoveredPos;
    }

    const bounds = new Rectangle(
      nodeJSON._temp.bounds.x,
      nodeJSON._temp.bounds.y,
      nodeJSON._temp.bounds.width,
      nodeJSON._temp.bounds.height,
    );

    const basePosition: PositionSchema =
      parent && !toContainer
        ? nodeJSON.meta.position
        : {
            x: offset.x + bounds.center.x,
            y: offset.y + bounds.y,
          };

    if (toContainer) {
      return this.dragService.adjustSubNodePosition(
        nodeJSON.type as string,
        toContainer,
        basePosition,
      );
    }

    return basePosition;
  }
  /** Get the container selected by the mouse */
  private getSelectedContainer(): WorkflowNodeEntity | undefined {
    const { activatedNode } = this.selection;
    if (activatedNode?.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
      return activatedNode;
    }
  }
  /** Get the selected node */
  private get selectedNodes(): WorkflowNodeEntity[] {
    return this.selection.selection.filter(
      n => n instanceof WorkflowNodeEntity,
    ) as WorkflowNodeEntity[];
  }
  /** selected node */
  private selectNodes(nodes: WorkflowNodeEntity[]): void {
    if (nodes.length === 1) {
      this.editService.focusNode(nodes[0]);
    } else {
      this.selection.selection = nodes;
    }
  }
  /** Scroll to Node */
  private async scrollToNodes(nodes: WorkflowNodeEntity[]): Promise<void> {
    const nodeBounds = nodes.map(
      node => node.getData(FlowNodeTransformData).bounds,
    );
    await this.document.playgroundConfig.scrollToView({
      bounds: Rectangle.enlarge(nodeBounds),
    });
  }
  /** Wait for the next frame. */
  private async nextTick(): Promise<void> {
    const frameTime = 16; // 16ms for a render frame
    await delay(frameTime);
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}
