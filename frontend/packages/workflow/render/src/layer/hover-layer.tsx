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

/* eslint-disable complexity */
import { inject, injectable } from 'inversify';
import { SelectorBoxConfigEntity } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import {
  EditorState,
  EditorStateConfigEntity,
  Layer,
  PlaygroundConfigEntity,
  observeEntities,
  observeEntity,
  observeEntityDatas,
  type LayerOptions,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  WorkflowDragService,
  WorkflowHoverService,
  WorkflowLineEntity,
  WorkflowLinesManager,
  WorkflowNodeEntity,
  WorkflowPortEntity,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

import { getSelectionBounds } from '../utils/selection-utils';
import { PORT_BG_CLASS_NAME } from '../constants/points';

export interface HoverLayerOptions extends LayerOptions {
  canHovered?: (e: MouseEvent, service: WorkflowHoverService) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace HoverLayerOptions {
  export const DEFAULT: HoverLayerOptions = {
    canHovered: () => true,
  };
}

const LINE_CLASS_NAME = '.gedit-flow-activity-line';
const NODE_CLASS_NAME = '.gedit-flow-activity-node';

@injectable()
export class HoverLayer extends Layer<HoverLayerOptions> {
  static type = 'HoverLayer';
  @inject(WorkflowDocument) document: WorkflowDocument;
  @inject(WorkflowSelectService) selectionService: WorkflowSelectService;
  @inject(WorkflowDragService) dragService: WorkflowDragService;
  @inject(WorkflowHoverService) hoverService: WorkflowHoverService;
  @inject(WorkflowLinesManager)
  linesManager: WorkflowLinesManager;
  @observeEntity(EditorStateConfigEntity)
  protected editorStateConfig: EditorStateConfigEntity;
  @observeEntity(SelectorBoxConfigEntity)
  protected selectorBoxConfigEntity: SelectorBoxConfigEntity;
  @inject(PlaygroundConfigEntity) configEntity: PlaygroundConfigEntity;
  /**
   * Listen node transform
   */
  @observeEntityDatas(WorkflowNodeEntity, FlowNodeTransformData)
  protected readonly nodeTransforms: FlowNodeTransformData[];
  /**
   * Sort by Selected
   * @private
   */
  protected nodeTransformsWithSort: FlowNodeTransformData[] = [];
  autorun(): void {
    const { activatedNode } = this.selectionService;
    this.nodeTransformsWithSort = this.nodeTransforms
      .filter(n => n.entity.id !== 'root')
      .reverse() // The post-created one comes first
      .sort(n1 => (n1.entity === activatedNode ? -1 : 0));
  }
  /**
   * monitor line
   */
  @observeEntities(WorkflowLineEntity)
  protected readonly lines: WorkflowLineEntity[];
  /**
   * Is the line being adjusted?
   * @protected
   */
  get isDrawing(): boolean {
    return this.linesManager.isDrawing;
  }
  onReady(): void {
    this.options = {
      ...HoverLayerOptions.DEFAULT,
      ...this.options,
    };
    this.toDispose.pushAll([
      // Monitor canvas mouse movement events
      this.listenPlaygroundEvent('mousemove', (e: MouseEvent) => {
        this.hoverService.hoveredPos = this.config.getPosFromMouseEvent(e);
        if (!this.isEnabled()) {
          return;
        }
        // @ts-expect-error -- linter-disable-autofix
        if (!this.options.canHovered(e, this.hoverService)) {
          return;
        }
        const mousePos = this.config.getPosFromMouseEvent(e);
        // Update hover status
        this.updateHoveredState(mousePos, e?.target as HTMLElement);
      }),
      this.selectionService.onSelectionChanged(() => this.autorun()),
      // Control selection logic
      this.listenPlaygroundEvent(
        'mousedown',
        (e: MouseEvent): boolean | undefined => {
          if (!this.isEnabled() || this.isDrawing) {
            return undefined;
          }
          const { hoveredNode } = this.hoverService;
          // Reset line
          if (hoveredNode && hoveredNode instanceof WorkflowLineEntity) {
            this.dragService.resetLine(hoveredNode, e);
            return true;
          }
          if (
            hoveredNode &&
            hoveredNode instanceof WorkflowPortEntity &&
            hoveredNode.portType !== 'input' &&
            !hoveredNode.disabled &&
            e.button !== 1
          ) {
            e.stopPropagation();
            e.preventDefault();
            this.selectionService.clear();
            this.dragService.startDrawingLine(hoveredNode, e);
            return true;
          }
          const mousePos = this.config.getPosFromMouseEvent(e);
          const selectionBounds = getSelectionBounds(
            this.selectionService,
            // Only multi-select mode is considered here, and radio mode has sunk into use-node-render
            true,
          );
          if (
            selectionBounds.width > 0 &&
            selectionBounds.contains(mousePos.x, mousePos.y)
          ) {
            /**
             * Drag select box
             */
            this.dragService.startDragSelectedNodes(e).then(dragSuccess => {
              if (!dragSuccess) {
                // The drag failed to trigger the click successfully.
                if (hoveredNode && hoveredNode instanceof WorkflowNodeEntity) {
                  if (e.metaKey || e.shiftKey || e.ctrlKey) {
                    this.selectionService.toggleSelect(hoveredNode);
                  } else {
                    this.selectionService.selectNode(hoveredNode);
                  }
                } else {
                  this.selectionService.clear();
                }
              }
            });
            // The trigger selector box will be organized here.
            return true;
          } else {
            if (!hoveredNode) {
              this.selectionService.clear();
            }
          }
          return undefined;
        },
      ),
    ]);
  }

  /**
   * Update hoverd
   * @param mousePos
   */
  updateHoveredState(mousePos: IPoint, target?: HTMLElement): void {
    const nodeTransforms = this.nodeTransformsWithSort;
    // //Determine whether the connection point is hover
    const portHovered = this.linesManager.getPortFromMousePos(mousePos);

    const lineDomNodes = this.playgroundNode.querySelectorAll(LINE_CLASS_NAME);
    const checkTargetFromLine = [...lineDomNodes].some(lineDom =>
      lineDom.contains(target as HTMLElement),
    );
    // By default, only output points can be hover
    if (portHovered) {
      // The output point can be directly selected.
      if (portHovered.portType === 'output') {
        this.updateHoveredKey(portHovered.id);
      } else if (
        checkTargetFromLine ||
        target?.className?.includes?.(PORT_BG_CLASS_NAME)
      ) {
        // The input point uses to get the closest line
        const lineHovered =
          this.linesManager.getCloseInLineFromMousePos(mousePos);
        if (lineHovered) {
          this.updateHoveredKey(lineHovered.id);
        }
      }
      return;
    }

    // Drawing situation, nodes and lines cannot be selected
    if (this.isDrawing) {
      return;
    }

    const nodeHovered = nodeTransforms.find((trans: FlowNodeTransformData) =>
      trans.bounds.contains(mousePos.x, mousePos.y),
    )?.entity as WorkflowNodeEntity;

    // Determine whether the element where the current mouse position is located is inside the node
    const nodeDomNodes = this.playgroundNode.querySelectorAll(NODE_CLASS_NAME);
    const checkTargetFromNode = [...nodeDomNodes].some(nodeDom =>
      nodeDom.contains(target as HTMLElement),
    );

    if (nodeHovered || checkTargetFromNode) {
      if (nodeHovered?.id) {
        this.updateHoveredKey(nodeHovered.id);
      }
    }

    const nodeInContainer = !!(
      nodeHovered?.parent && nodeHovered.parent.flowNodeType !== 'root'
    );

    // Get the closest line
    // Lines will intersect. You need to get the line closest to the point. Lines that cannot be deleted cannot be selected.
    const lineHovered = checkTargetFromLine
      ? this.linesManager.getCloseInLineFromMousePos(mousePos)
      : undefined;
    const lineInContainer = !!lineHovered?.inContainer;

    // Determine whether the node in the container is hover
    if (nodeHovered && nodeInContainer) {
      this.updateHoveredKey(nodeHovered.id);
      return;
    }
    // Determine whether the lines in the container are hovered
    if (lineHovered && lineInContainer) {
      this.updateHoveredKey(lineHovered.id);
      return;
    }

    // Determine whether the node is hovering
    if (nodeHovered) {
      this.updateHoveredKey(nodeHovered.id);
      return;
    }
    // Determine if the line is hovering
    if (lineHovered) {
      this.hoverService.updateHoveredKey(lineHovered.id);
      return;
    }

    // None of the above logic hits, then clear the hoverd.
    this.hoverService.clearHovered();

    const currentState = this.editorStateConfig.getCurrentState();
    const isMouseFriendly =
      currentState === EditorState.STATE_MOUSE_FRIENDLY_SELECT;

    // The mouse is given priority, and instead of holding down the shift button, it is updated to small hands.
    if (isMouseFriendly && !this.editorStateConfig.isPressingShift) {
      this.configEntity.updateCursor('grab');
    }
  }

  updateHoveredKey(key: string): void {
    // Mouse priority interaction mode, if it is hover, you need to remove the small hand of the mouse and restore the original style of the mouse
    this.configEntity.updateCursor('default');
    this.hoverService.updateHoveredKey(key);
  }

  /**
   * Determine if it can be hover
   * Can @returns hover?
   */
  isEnabled(): boolean {
    const currentState = this.editorStateConfig.getCurrentState();
    // Select box condition disable hover
    return (
      (currentState === EditorState.STATE_SELECT ||
        currentState === EditorState.STATE_MOUSE_FRIENDLY_SELECT) &&
      !this.selectorBoxConfigEntity.isStart &&
      !this.dragService.isDragging
    );
  }
}
