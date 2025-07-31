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

import { injectable, inject } from 'inversify';
import { WorkflowMode } from '@coze-workflow/base/api';
import {
  reporter,
  StandardNodeType,
  type WorkflowJSON,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { HistoryService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { delay, Emitter, logger } from '@flowgram-adapter/common';

import { EncapsulateValidateService } from '../validate';
import { isNodeInSubCanvas } from '../utils/subcanvas';
import { randomNameSuffix } from '../utils/random-name-suffix';
import { hasSubCanvasNodes } from '../utils/has-sub-canvas-nodes';
import { getSubWorkflowInfo } from '../utils';
import { EncapsulateGenerateService } from '../generate';
import { EncapsulateContext } from '../encapsulate-context';
import { EncapsulateApiService } from '../api';
import {
  type EncapsulateErrorResult,
  type EncapsulateResult,
  type EncapsulateService,
} from './types';
import { EncapsulateVariableService } from './encapsulate-variable-service';
import { EncapsulateNodesService } from './encapsulate-nodes-service';
import { EncapsulateLinesService } from './encapsulate-lines-service';

@injectable()
export class EncapsulateServiceImpl implements EncapsulateService {
  private onEncapsulateEmitter = new Emitter<EncapsulateResult>();

  public readonly onEncapsulate = this.onEncapsulateEmitter.event;

  @inject(EncapsulateValidateService)
  private encapsulateValidateService: EncapsulateValidateService;

  @inject(EncapsulateGenerateService)
  private encapsulateGenerateService: EncapsulateGenerateService;

  @inject(WorkflowSelectService)
  private workflowSelectService: WorkflowSelectService;

  @inject(EncapsulateNodesService)
  private encapsulateNodesService: EncapsulateNodesService;

  @inject(EncapsulateApiService)
  private encapsulateApiService: EncapsulateApiService;

  @inject(EncapsulateContext)
  private encapsulateContext: EncapsulateContext;

  @inject(EncapsulateLinesService)
  private encapsulateLinesService: EncapsulateLinesService;

  @inject(EncapsulateVariableService)
  private encapsulateVariableService: EncapsulateVariableService;

  @inject(HistoryService)
  private historyService: HistoryService;

  @inject(WorkflowDocument)
  private workflowDocument: WorkflowDocument;

  private encapsulating = false;
  private decapsulating = false;

  validate() {
    const { selectedNodes } = this.workflowSelectService;
    return this.encapsulateValidateService.validate(selectedNodes);
  }

  canEncapsulate(): boolean {
    return this.encapsulateContext.enabled;
  }

  async encapsulate() {
    if (!this.canEncapsulate()) {
      return this.encapsulateError('encapsulate is not enabled');
    }

    if (this.encapsulating) {
      return this.encapsulateError('encapsulating');
    }

    const name = `${
      this.encapsulateContext.flowName || ''
    }_sub_${randomNameSuffix()}`;
    const { selectedNodes } = this.workflowSelectService;

    if (selectedNodes.length < 2) {
      return this.encapsulateError('at least 2 nodes');
    }

    reporter.event({ eventName: 'workflow_encapsulate' });

    this.encapsulating = true;

    let res;
    try {
      res = await this.encapsulateNodes(name, selectedNodes);
      // Encapsulation complete Select the encapsulated node
      if (res.success) {
        this.workflowSelectService.selectNode(res.subFlowNode);
      }

      this.onEncapsulateEmitter.fire(res);
    } finally {
      this.encapsulating = false;
    }
    return res;
  }

  canDecapsulate(node: WorkflowNodeEntity) {
    return (
      this.encapsulateContext.enabled &&
      node.flowNodeType === StandardNodeType.SubWorkflow
    );
  }

  async decapsulate(node: WorkflowNodeEntity) {
    if (!node || !this.canDecapsulate(node) || this.decapsulating) {
      return;
    }

    reporter.event({ eventName: 'workflow_decapsulate' });
    this.decapsulating = true;
    try {
      await this.decapsulateNode(node);
    } finally {
      this.decapsulating = false;
    }
  }

  async decapsulateNode(node: WorkflowNodeEntity) {
    const info = getSubWorkflowInfo(node);

    if (!info) {
      return;
    }

    // Get process data
    const workflow = await this.encapsulateApiService.getWorkflow(
      info.spaceId && info.spaceId !== '0'
        ? info.spaceId
        : this.encapsulateContext.spaceId,
      info.workflowId,
      info.workflowVersion,
    );

    if (!workflow) {
      return;
    }

    if (workflow.nodes.length <= 2) {
      return;
    }

    // If you unseal the nodes in the sub-canvas, you need to verify whether there is a sub-canvas.
    if (
      isNodeInSubCanvas(node) &&
      hasSubCanvasNodes(this.workflowDocument, workflow.nodes)
    ) {
      Toast.warning(
        I18n.t(
          'workflow_encapsulate_toast_batch_or_loop',
          undefined,
          '在循环/批处理中解散的工作流不能包含循环或批处理节点',
        ),
      );
      return;
    }

    this.historyService.startTransaction();

    // Node-centric expansion
    this.encapsulateNodesService.decapsulateLayout(node, workflow.nodes);

    // Create Node
    const { idsMap, startNode, endNode, middleNodes } =
      await this.encapsulateNodesService.createDecapsulateNodes(
        node,
        workflow.nodes,
        node.parent?.id,
      );

    // Update variable reference after unblocking
    this.encapsulateVariableService.updateVarsAfterDecapsulate(node, {
      idsMap,
      startNode,
      endNode,
      middleNodes,
    });

    // Create a connection
    this.encapsulateLinesService.createDecapsulateLines({
      node,
      workflowJSON: workflow as WorkflowJSON,
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      idsMap,
    });

    await delay(30);

    // Remove old node
    await this.encapsulateNodesService.deleteNodes([node]);
    this.historyService.endTransaction();
  }

  dispose() {
    this.onEncapsulateEmitter.dispose();
  }

  private async encapsulateNodes(
    name: string,
    nodes: WorkflowNodeEntity[],
  ): Promise<EncapsulateResult> {
    const ports =
      this.encapsulateLinesService.getValidEncapsulateConnectPorts(nodes);

    const encapsulateVars =
      this.encapsulateVariableService.getEncapsulateVars(nodes);

    const startEndRects =
      this.encapsulateNodesService.getEncapsulateStartEndRects(nodes);

    // Generate JSON and update the variable references in JSON
    const json = await this.encapsulateGenerateService.generateWorkflowJSON(
      nodes,
      {
        startEndRects,
      },
    );

    let workflowId;
    let flowMode = WorkflowMode.Workflow;
    if (
      this.encapsulateContext.isChatFlow &&
      encapsulateVars.startVars.USER_INPUT &&
      encapsulateVars.startVars.CONVERSATION_NAME
    ) {
      flowMode = WorkflowMode.ChatFlow;
    }

    try {
      // save process
      const res = await this.encapsulateApiService.encapsulateWorkflow({
        name,
        desc: name,
        json,
        flowMode,
      });
      workflowId = res?.workflowId;
    } catch (error) {
      logger.error(error);
      return this.encapsulateError('encapsulate workflow failed');
    }

    if (!workflowId) {
      return this.encapsulateError(
        'encapsulate workflow failed no workflowId returned',
      );
    }

    this.historyService.startTransaction();
    // Replace with calling process node
    const subFlowNode =
      await this.encapsulateNodesService.createEncapsulateNode(
        workflowId,
        name,
        nodes,
      );

    // Update variable references (upstream and downstream + encapsulate node itself input)
    this.encapsulateVariableService.updateVarsAfterEncapsulate(
      subFlowNode,
      nodes,
      encapsulateVars,
    );

    // Remove old node
    await this.encapsulateNodesService.deleteNodes(nodes);

    // Create a new connection
    const { inputLines, outputLines } =
      this.encapsulateLinesService.createEncapsulateLines(ports, subFlowNode);
    await delay(30);

    this.historyService.endTransaction();
    return {
      success: true,
      subFlowNode,
      inputLines,
      outputLines,
      workflowId,
      projectId: this.encapsulateContext.projectId,
    };
  }

  private encapsulateError(message: string): EncapsulateErrorResult {
    return {
      success: false,
      message,
    };
  }
}
