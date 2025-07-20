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

    const name = `${this.encapsulateContext.flowName || ''}_sub_${randomNameSuffix()}`;
    const { selectedNodes } = this.workflowSelectService;

    if (selectedNodes.length < 2) {
      return this.encapsulateError('at least 2 nodes');
    }

    reporter.event({ eventName: 'workflow_encapsulate' });

    this.encapsulating = true;

    let res;
    try {
      res = await this.encapsulateNodes(name, selectedNodes);
      // 封装完成选中封装后的节点
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

    // 获取流程数据
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

    // 如果解封子画布里面的节点，需要校验是否有子画布
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

    // 以节点为中心向外扩张
    this.encapsulateNodesService.decapsulateLayout(node, workflow.nodes);

    // 创建节点
    const { idsMap, startNode, endNode, middleNodes } =
      await this.encapsulateNodesService.createDecapsulateNodes(
        node,
        workflow.nodes,
        node.parent?.id,
      );

    // 解封后更新变量引用
    this.encapsulateVariableService.updateVarsAfterDecapsulate(node, {
      idsMap,
      startNode,
      endNode,
      middleNodes,
    });

    // 创建连线
    this.encapsulateLinesService.createDecapsulateLines({
      node,
      workflowJSON: workflow as WorkflowJSON,
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      idsMap,
    });

    await delay(30);

    // 移除老节点
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

    // 生成 json，并更新 JSON 内的变量引用
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
      // 保存流程
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
    // 替换成调用流程节点
    const subFlowNode =
      await this.encapsulateNodesService.createEncapsulateNode(
        workflowId,
        name,
        nodes,
      );

    // 更新变量引用（上下游 + 封装节点本身输入）
    this.encapsulateVariableService.updateVarsAfterEncapsulate(
      subFlowNode,
      nodes,
      encapsulateVars,
    );

    // 移除老节点
    await this.encapsulateNodesService.deleteNodes(nodes);

    // 生成新连线
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
