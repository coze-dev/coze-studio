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
   * 监听节点 transform
   */
  @observeEntityDatas(WorkflowNodeEntity, FlowNodeTransformData)
  protected readonly nodeTransforms: FlowNodeTransformData[];
  /**
   * 按选中排序
   * @private
   */
  protected nodeTransformsWithSort: FlowNodeTransformData[] = [];
  autorun(): void {
    const { activatedNode } = this.selectionService;
    this.nodeTransformsWithSort = this.nodeTransforms
      .filter(n => n.entity.id !== 'root')
      .reverse() // 后创建的排在前面
      .sort(n1 => (n1.entity === activatedNode ? -1 : 0));
  }
  /**
   * 监听线条
   */
  @observeEntities(WorkflowLineEntity)
  protected readonly lines: WorkflowLineEntity[];
  /**
   * 是否正在调整线条
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
      // 监听画布鼠标移动事件
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
        // 更新 hover 状态
        this.updateHoveredState(mousePos, e?.target as HTMLElement);
      }),
      this.selectionService.onSelectionChanged(() => this.autorun()),
      // 控制选中逻辑
      this.listenPlaygroundEvent(
        'mousedown',
        (e: MouseEvent): boolean | undefined => {
          if (!this.isEnabled() || this.isDrawing) {
            return undefined;
          }
          const { hoveredNode } = this.hoverService;
          // 重置线条
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
            // 这里只考虑多选模式，单选模式已经下沉到 use-node-render 中
            true,
          );
          if (
            selectionBounds.width > 0 &&
            selectionBounds.contains(mousePos.x, mousePos.y)
          ) {
            /**
             * 拖拽选择框
             */
            this.dragService.startDragSelectedNodes(e).then(dragSuccess => {
              if (!dragSuccess) {
                // 拖拽没有成功触发了点击
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
            // 这里会组织触发 selector box
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
   * 更新 hoverd
   * @param mousePos
   */
  updateHoveredState(mousePos: IPoint, target?: HTMLElement): void {
    const nodeTransforms = this.nodeTransformsWithSort;
    // // 判断连接点是否 hover
    const portHovered = this.linesManager.getPortFromMousePos(mousePos);

    const lineDomNodes = this.playgroundNode.querySelectorAll(LINE_CLASS_NAME);
    const checkTargetFromLine = [...lineDomNodes].some(lineDom =>
      lineDom.contains(target as HTMLElement),
    );
    // 默认 只有 output 点位可以 hover
    if (portHovered) {
      // 输出点可以直接选中
      if (portHovered.portType === 'output') {
        this.updateHoveredKey(portHovered.id);
      } else if (
        checkTargetFromLine ||
        target?.className?.includes?.(PORT_BG_CLASS_NAME)
      ) {
        // 输入点采用获取最接近的线条
        const lineHovered =
          this.linesManager.getCloseInLineFromMousePos(mousePos);
        if (lineHovered) {
          this.updateHoveredKey(lineHovered.id);
        }
      }
      return;
    }

    // Drawing 情况，不能选中节点和线条
    if (this.isDrawing) {
      return;
    }

    const nodeHovered = nodeTransforms.find((trans: FlowNodeTransformData) =>
      trans.bounds.contains(mousePos.x, mousePos.y),
    )?.entity as WorkflowNodeEntity;

    // 判断当前鼠标位置所在元素是否在节点内部
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

    // 获取最接近的线条
    // 线条会相交需要获取最接近点位的线条，不能删除的线条不能被选中
    const lineHovered = checkTargetFromLine
      ? this.linesManager.getCloseInLineFromMousePos(mousePos)
      : undefined;
    const lineInContainer = !!lineHovered?.inContainer;

    // 判断容器内节点是否 hover
    if (nodeHovered && nodeInContainer) {
      this.updateHoveredKey(nodeHovered.id);
      return;
    }
    // 判断容器内线条是否 hover
    if (lineHovered && lineInContainer) {
      this.updateHoveredKey(lineHovered.id);
      return;
    }

    // 判断节点是否 hover
    if (nodeHovered) {
      this.updateHoveredKey(nodeHovered.id);
      return;
    }
    // 判断线条是否 hover
    if (lineHovered) {
      this.hoverService.updateHoveredKey(lineHovered.id);
      return;
    }

    // 上述逻辑都未命中 则清空 hoverd
    this.hoverService.clearHovered();

    const currentState = this.editorStateConfig.getCurrentState();
    const isMouseFriendly =
      currentState === EditorState.STATE_MOUSE_FRIENDLY_SELECT;

    // 鼠标优先，并且不是按住 shift 键，更新为小手
    if (isMouseFriendly && !this.editorStateConfig.isPressingShift) {
      this.configEntity.updateCursor('grab');
    }
  }

  updateHoveredKey(key: string): void {
    // 鼠标优先交互模式，如果是 hover，需要将鼠标的小手去掉，还原鼠标原有样式
    this.configEntity.updateCursor('default');
    this.hoverService.updateHoveredKey(key);
  }

  /**
   * 判断是否能够 hover
   * @returns 是否能 hover
   */
  isEnabled(): boolean {
    const currentState = this.editorStateConfig.getCurrentState();
    // 选择框情况禁止 hover
    return (
      (currentState === EditorState.STATE_SELECT ||
        currentState === EditorState.STATE_MOUSE_FRIENDLY_SELECT) &&
      !this.selectorBoxConfigEntity.isStart &&
      !this.dragService.isDragging
    );
  }
}
