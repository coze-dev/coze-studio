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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { set } from 'lodash-es';
import { inject, injectable } from 'inversify';
import {
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeMeta,
  WorkflowSelectService,
  getAntiOverlapPosition,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
  type WorkflowNodeRegistry,
  type WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { StandardNodeType, reporter } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import { handlePluginRiskWarning } from '@coze-agent-ide/plugin-risk-warning';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { getNodeV2Registry, isNodeV2 } from '@/nodes-v2';
import { LayoutPanelKey } from '@/constants';

import { WorkflowGlobalStateEntity } from '../entities';
import { WorkflowFloatLayoutService } from './workflow-float-layout-service';
import { WorkflowCustomDragService } from './workflow-drag-service';

/**
 * Invoke the canvas editing service
 */
@injectable()
export class WorkflowEditService {
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowCustomDragService)
  readonly dragService: WorkflowCustomDragService;
  @inject(WorkflowGlobalStateEntity) workflowState: WorkflowGlobalStateEntity;
  @inject(WorkflowDocument) protected workflowDocument: WorkflowDocument;
  @inject(WorkflowSelectService) protected selectService: WorkflowSelectService;
  @inject(WorkflowNodesService) protected nodesService: WorkflowNodesService;
  @inject(PlaygroundConfigEntity)
  protected playgroundConfig: PlaygroundConfigEntity;
  @inject(WorkflowFloatLayoutService)
  protected floatLayoutService: WorkflowFloatLayoutService;
  @inject(WorkflowPlaygroundContext)
  protected context: WorkflowPlaygroundContext;

  /**
   * Create Node
   * @param type
   * @param nodeJson
   * @param event
   */
  // eslint-disable-next-line max-params
  addNode = async (
    type: StandardNodeType,
    nodeJson?: Partial<WorkflowNodeJSON>,
    event?: { clientX: number; clientY: number },
    isDrag?: boolean,
  ): Promise<WorkflowNodeEntity | undefined> => {
    if (this.globalState.readonly) {
      return;
    }
    if (type === StandardNodeType.Api) {
      handlePluginRiskWarning();
    }
    let dragNode: WorkflowNodeEntity | undefined;
    // create uniq title
    if (nodeJson && nodeJson.data.nodeMeta.title) {
      nodeJson.data.nodeMeta.title = this.nodesService.createUniqTitle(
        nodeJson.data.nodeMeta.title,
      );
    }

    if (!event) {
      // exception handling
      this.dragService.endDrag();
      return;
    }

    try {
      // node initialization logic
      const nodeV2Registry = getNodeV2Registry(type);
      await nodeV2Registry?.onInit?.(
        nodeJson as WorkflowNodeJSON,
        this.context,
      );
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_registry_v2_on_init_error',
        namespace: 'workflow',
        error,
      });
    }

    if (isDrag) {
      // Drag and drop to generate nodes
      dragNode = await this.dragService.dropCard(
        type,
        event,
        nodeJson,
        this.dragService.state.dropNode,
      );
    } else {
      // @Deprecated The logic here cannot run here at present, you can consider deleting it later.
      let position: IPoint;
      const nodeMeta =
        this.workflowDocument.getNodeRegister<WorkflowNodeRegistry>(type).meta;
      const { width } = nodeMeta?.size || { width: 0, height: 0 };
      position = this.playgroundConfig.getPosFromMouseEvent(event);
      position = getAntiOverlapPosition(this.workflowDocument, {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        x: position.x + width / 2,
        y: position.y,
      });
      const dropNode = this.getDropNode();
      const { allowDrop } = this.dragService.canDropToNode({
        dragNodeType: type,
        dropNode,
      });
      if (!allowDrop) {
        return;
      }
      if (dropNode && dropNode.flowNodeType !== FlowNodeBaseType.ROOT) {
        const childrenLength = dropNode.collapsedChildren.length;
        const dropNodePadding =
          this.workflowDocument.layout.getPadding(dropNode);
        position = {
          x: dropNodePadding.left + childrenLength * 30,
          y: dropNodePadding.top + childrenLength * 30,
        };
      }
      dragNode = await this.workflowDocument.createWorkflowNodeByType(
        type,
        position as IPoint,
        nodeJson,
        dropNode.id,
      );
    }
    this.dragService.endDrag();
    if (dragNode) {
      this.focusNode(dragNode);
    }
    return dragNode;
  };

  private getDropNode(): WorkflowNodeEntity {
    const { activatedNode } = this.selectService;
    if (!activatedNode) {
      return this.workflowDocument.root;
    }
    const linageNodes: WorkflowNodeEntity[] = [];
    let currentNode: WorkflowNodeEntity | undefined = activatedNode;
    while (currentNode) {
      linageNodes.push(currentNode);
      currentNode = currentNode.parent;
    }
    return (
      linageNodes.find(
        n =>
          [FlowNodeBaseType.ROOT, FlowNodeBaseType.SUB_CANVAS].includes(
            n.flowNodeType as FlowNodeBaseType,
          ) || n.getNodeMeta<WorkflowNodeMeta>().isContainer,
      ) ?? this.workflowDocument.root
    );
  }

  /**
   * copy node
   * @param node
   */
  copyNode = async (node: WorkflowNodeEntity): Promise<WorkflowNodeEntity> => {
    const json = await this.workflowDocument.toNodeJSON(node);
    const position = {
      x: json.meta!.position!.x + 30,
      y: json.meta!.position!.y + 30,
    };
    const newNode = await this.workflowDocument.copyNodeFromJSON(
      json.type as string,
      this.recreateNodeJSON(json),
      '',
      position,
      node.parent?.id,
    );
    const subCanvas: WorkflowSubCanvas = newNode
      .getNodeMeta()
      ?.subCanvas?.(newNode);
    if (subCanvas?.canvasNode) {
      this.selectService.selection = [newNode, subCanvas.canvasNode];
    } else {
      this.focusNode(newNode);
    }
    return newNode;
  };

  /**
   * Delete lines
   */
  deleteNode = (node: WorkflowNodeEntity, noConfirm?: boolean) => {
    if (noConfirm) {
      this.disposeNode(node);
    } else {
      Modal.error({
        // closable: false,
        title: I18n.t('workflow_detail_select_delete_popup_title'),
        content: I18n.t('workflow_detail_select_delete_popup_subtitle'),
        onOk: () => this.disposeNode(node),
        okText: I18n.t('workflow_add_delete'),
        cancelText: I18n.t('Cancel'),
      });
    }
  };

  /**
   * Before destroying the node, run the node's custom onDispose method
   * @param node
   */
  private disposeNode(node: WorkflowNodeEntity) {
    if (isNodeV2(node)) {
      const formModel = node
        .getData<FlowNodeFormData>(FlowNodeFormData)
        .getFormModel<FormModelV2>();

      node.getNodeRegister()?.onDispose?.(formModel.getValues(), this.context);
    }

    node.dispose();
  }

  recreateNodeJSON(
    nodeJSON: WorkflowNodeJSON,
    titleCache: string[] = [],
    shouldReplaceId = true,
  ): WorkflowNodeJSON {
    // Override ID
    if (shouldReplaceId) {
      nodeJSON.id = this.nodesService.createUniqID();
    }
    // Override title
    if (nodeJSON.data?.nodeMeta?.title) {
      set(
        nodeJSON,
        'data.nodeMeta.title',
        this.nodesService.createUniqTitle(
          nodeJSON.data.nodeMeta.title,
          undefined,
          titleCache,
        ),
      );
      titleCache.push(nodeJSON.data.nodeMeta.title);
    }
    // Recursive processing of sub-nodes
    if (nodeJSON.blocks) {
      nodeJSON.blocks = nodeJSON.blocks.map(n =>
        this.recreateNodeJSON(n, titleCache),
      );
    }
    return nodeJSON;
  }

  /** Select the node and switch the node if the floating panel on the right is a node form */
  focusNode(node?: WorkflowNodeEntity): void {
    if (node) {
      this.selectService.selectNodeAndFocus(node);
    }
    if (
      this.floatLayoutService.getPanel('right').key !== LayoutPanelKey.NodeForm
    ) {
      return;
    }
    if (!node) {
      this.floatLayoutService.close('right');
      return;
    }
    this.floatLayoutService.open(LayoutPanelKey.NodeForm, 'right', {
      node,
    });
  }
}
