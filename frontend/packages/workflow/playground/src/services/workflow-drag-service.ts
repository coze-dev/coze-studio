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
 
import { type XYCoord } from 'react-dnd';

import { inject, injectable } from 'inversify';
import {
  FlowNodeBaseType,
  FlowNodeTransformData,
} from '@flowgram-adapter/free-layout-editor';
import { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  WorkflowDragService,
  WorkflowSelectService,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
  type WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';
import {
  Emitter,
  Rectangle,
  type PositionSchema,
} from '@flowgram-adapter/common';
import { StandardNodeType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

export interface CardDragEvent {
  type: 'startDrag' | 'endDrag';
  nodeType?: StandardNodeType;
  json?: Partial<WorkflowNodeJSON>;
}

interface WorkflowCustomDragServiceState {
  isDragging: boolean;
  dragNode?: {
    type: StandardNodeType;
    json?: Partial<WorkflowNodeJSON>;
  };
  transforms?: FlowNodeTransformData[];
  dropNode?: WorkflowNodeEntity;
}

@injectable()
export class WorkflowCustomDragService extends WorkflowDragService {
  public state: WorkflowCustomDragServiceState;

  private cardDragEmitter = new Emitter<CardDragEvent>();

  readonly onCardDrag = this.cardDragEmitter.event;

  constructor(
    @inject(WorkflowDocument) protected document: WorkflowDocument,
    @inject(WorkflowSelectService)
    protected selectService: WorkflowSelectService,
    @inject(PlaygroundConfigEntity)
    protected playgroundConfig: PlaygroundConfigEntity,
  ) {
    super();
    this.initState();
    this._toDispose.pushAll([this.cardDragEmitter]);
  }
  /** 开始拖拽 */
  public startDrag(dragNode: WorkflowCustomDragServiceState['dragNode']): void {
    const { isDragging, dragNode: oldDragNode } = this.state;
    if (isDragging && oldDragNode) {
      return;
    }
    this.isDragging = true;
    this.state.isDragging = true;
    this.state.dragNode = dragNode;
    const containerTransforms = this.document
      .getRenderDatas(FlowNodeTransformData, false)
      .filter(transform => {
        const { entity } = transform;
        if (entity.originParent) {
          return (
            entity.getNodeMeta().selectable &&
            entity.originParent.getNodeMeta().selectable
          );
        }
        return entity.getNodeMeta().selectable;
      })
      .filter(transform => {
        const { entity } = transform;
        return entity.getNodeMeta<WorkflowNodeMeta>().isContainer;
      });
    this.state.transforms = containerTransforms;
    this.cardDragEmitter.fire({
      type: 'startDrag',
      nodeType: dragNode?.type,
      json: dragNode?.json,
    });
  }
  /** 结束拖拽 */
  public endDrag() {
    const { isDragging, dragNode } = this.state;
    if (!isDragging && !dragNode?.type) {
      return;
    }
    this.isDragging = false;
    this.state.isDragging = false;
    this.state.dragNode = undefined;
    this.state.transforms = undefined;
    this.cardDragEmitter.fire({
      type: 'endDrag',
      nodeType: dragNode?.type,
      json: dragNode?.json,
    });
  }
  /** 根据坐标判断是否可放置 */
  public canDrop(params: {
    coord: XYCoord;
    dragNode: WorkflowCustomDragServiceState['dragNode'];
  }): boolean {
    const { dragNode } = params;
    if (!dragNode?.type) {
      return false;
    }
    const { allowDrop, dropNode } = this.computeCanDrop(params);
    this.setDropNode(dropNode);
    return allowDrop;
  }

  /**
   * 是否可放置到节点
   * NOTICE: 以下逻辑后续如果还有特化，需要考虑放到节点meta配置中
   */
  public canDropToNode(params: {
    dragNodeType?: StandardNodeType;
    dropNode?: WorkflowNodeEntity;
  }): {
    allowDrop: boolean;
    message?: string;
    dropNode?: WorkflowNodeEntity;
  } {
    const { dragNodeType } = params;
    const dropNode: WorkflowNodeEntity = params.dropNode ?? this.document.root;
    if (!dragNodeType) {
      return {
        allowDrop: false,
      };
    }
    // 开始 / 结束节点不允许放入任何容器
    if ([StandardNodeType.Start, StandardNodeType.End].includes(dragNodeType)) {
      return {
        allowDrop: false,
        dropNode,
      };
    }
    // Loop / Batch 节点不允许嵌套
    if (
      [StandardNodeType.Loop, StandardNodeType.Batch].includes(dragNodeType) &&
      dropNode?.getNodeMeta<WorkflowNodeMeta>().isContainer
    ) {
      return {
        allowDrop: false,
        message: I18n.t('workflow_loop_nest_tips'),
        dropNode,
      };
    }
    // Break节点与SetVariable节点仅能拖入Loop节点
    if (
      [
        StandardNodeType.Break,
        StandardNodeType.Continue,
        StandardNodeType.SetVariable,
      ].includes(dragNodeType)
    ) {
      const dropNodeMeta = dropNode.getNodeMeta<WorkflowNodeMeta>();
      const dropSubCanvas = dropNodeMeta.subCanvas?.(dropNode);
      if (
        dropSubCanvas?.isCanvas &&
        dropSubCanvas.parentNode.flowNodeType === StandardNodeType.Loop
      ) {
        return {
          allowDrop: true,
          message: I18n.t('workflow_loop_release_tips'),
          dropNode,
        };
      } else {
        return {
          allowDrop: false,
          message: I18n.t('workflow_loop_onlycanva_tips'),
          dropNode,
        };
      }
    }
    // 放置节点为容器
    if (
      [FlowNodeBaseType.ROOT, FlowNodeBaseType.SUB_CANVAS].includes(
        dropNode.flowNodeType as FlowNodeBaseType,
      ) ||
      dropNode.getNodeMeta<WorkflowNodeMeta>().isContainer
    ) {
      return {
        allowDrop: true,
        dropNode,
      };
    }
    return {
      allowDrop: false,
    };
  }

  /** 是否可放置 */
  public computeCanDrop(params: {
    coord: XYCoord;
    dragNode: WorkflowCustomDragServiceState['dragNode'];
  }): {
    allowDrop: boolean;
    message?: string;
    dropNode?: WorkflowNodeEntity;
  } {
    const { coord, dragNode } = params;
    const addNodePanelWidth = 200;
    const position = this.playgroundConfig.getPosFromMouseEvent(
      {
        clientX: coord.x + addNodePanelWidth,
        clientY: coord.y,
      },
      true,
    );
    if (!dragNode?.type) {
      return {
        allowDrop: false,
      };
    }
    const collisionTransform = this.getCollisionTransform({
      position,
      dragNode,
    });
    const dropNode = collisionTransform?.entity;
    return this.canDropToNode({
      dragNodeType: dragNode.type,
      dropNode,
    });
  }
  /** 初始化状态 */
  private initState(): void {
    this.state = {
      isDragging: false,
      dragNode: undefined,
      transforms: undefined,
      dropNode: undefined,
    };
  }
  /** 获取重叠位置 */
  private getCollisionTransform(params: {
    position: PositionSchema;
    dragNode: WorkflowCustomDragServiceState['dragNode'];
  }): FlowNodeTransformData | undefined {
    const { transforms } = this.state;
    const { position, dragNode } = params;
    if (!dragNode?.type || !transforms || transforms.length === 0) {
      return undefined;
    }
    const draggingRect = new Rectangle(position.x, position.y, 200, 30);
    const collisionTransform = transforms.find(transform => {
      const { bounds, entity } = transform;
      const padding = this.document.layout.getPadding(entity);
      const transformRect = new Rectangle(
        bounds.x + padding.left + padding.right,
        bounds.y,
        bounds.width,
        bounds.height,
      );
      // 检测两个正方形是否相互碰撞
      return Rectangle.intersects(draggingRect, transformRect);
    });
    return collisionTransform;
  }
  /** 设置当前放置节点 */
  private setDropNode(newDropNode?: WorkflowNodeEntity) {
    this.state.dropNode = newDropNode;
    if (newDropNode) {
      this.selectService.select(newDropNode);
    } else {
      this.selectService.clear();
    }
  }
}
