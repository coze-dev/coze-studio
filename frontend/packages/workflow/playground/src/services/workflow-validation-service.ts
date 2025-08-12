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

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { inject, injectable } from 'inversify';
import {
  FlowNodeFormData,
  getNodeError,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeMeta,
  type WorkflowNodeEntity,
  WorkflowNodePortsData,
  type WorkflowPortEntity,
  WorkflowNodeLinesData,
} from '@flowgram-adapter/free-layout-editor';
import { GlobalVariableService } from '@coze-workflow/variable';
import { SETTING_ON_ERROR_PORT } from '@coze-workflow/nodes';
import {
  type ValidationService,
  type ValidationState,
  type ValidateErrorMap,
  type ValidateError,
  type ValidateResult,
  type WorkflowValidateErrorMap,
} from '@coze-workflow/base/services';
import { workflowApi, StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  ValidateErrorType,
  type ValidateTreeRequest,
  type ValidateErrorData,
  type ValidateTreeInfo,
} from '@coze-arch/bot-api/workflow_api';

import { WorkflowGlobalStateEntity } from '../entities';

const createStore = () =>
  createWithEqualityFn<ValidationState>(
    () => ({
      errors: {},
      errorsV2: {},
      validating: false,
    }),
    shallow,
  );

const isLineError = (data: ValidateErrorData) =>
  data.type === ValidateErrorType.BotConcurrentPathErr ||
  data.type === ValidateErrorType.BotValidatePathErr;
const formatSchemaError2ValidateError = (
  data?: ValidateErrorData[],
): ValidateErrorMap => {
  const map: ValidateErrorMap = {};
  if (!data) {
    return map;
  }

  data.forEach(item => {
    const { node_error, path_error } = item;
    const isLine = isLineError(item);
    const nodeId = (isLine ? path_error?.start : node_error?.node_id) || '';
    const targetNodeId = isLine ? path_error?.end : undefined;
    const errorType = isLine ? 'line' : 'node';
    const error: ValidateError = {
      nodeId,
      targetNodeId,
      errorType,
      errorInfo: item.message || '',
      errorLevel: 'error',
    };
    const errors = map[nodeId] || [];
    errors.push(error);
    map[nodeId] = errors;
  });

  return map;
};
const formatSchemaError2WorkflowError = (data?: ValidateTreeInfo[]) => {
  const map: WorkflowValidateErrorMap = {};
  if (!data) {
    return map;
  }
  data.forEach(item => {
    const { errors, workflow_id, ...rest } = item;
    if (!errors?.length || !workflow_id) {
      return;
    }
    map[workflow_id] = {
      workflowId: workflow_id,
      ...rest,
      errors: formatSchemaError2ValidateError(errors),
    };
  });
  return map;
};

/**
 * Workflow Execution Status Validation Service
 */
@injectable()
export class WorkflowValidationService implements ValidationService {
  @inject(WorkflowDocument) private readonly document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;
  @inject(GlobalVariableService)
  private readonly globalVariable: GlobalVariableService;

  store = createStore();

  /** Verified node */
  public validatedNodeMap: Record<string, boolean> = {};

  /** Clear Verified Node State */
  public clearValidatedNodeMap() {
    this.validatedNodeMap = {};
  }

  /** check node */
  public async validateNode(node: WorkflowNodeEntity): Promise<ValidateResult> {
    const nodeErrorResult = this.validateNodeError(node);
    const formValidateResult = await this.validateForm(node);
    const subCanvasPortValidateResult = this.validateSubCanvasPort(node);
    const settingOnErrorResult = this.validateSettingOnErrorPort(node);

    const validateResults = [
      nodeErrorResult,
      formValidateResult,
      subCanvasPortValidateResult,
      settingOnErrorResult,
    ].filter(Boolean) as ValidateResult[];

    return this.mergeValidateResult(...validateResults);
  }

  /** validation workflow */
  public async validateWorkflow(): Promise<ValidateResult> {
    const nodes = this.document.getAssociatedNodes();
    const results: ValidateResult[] = await Promise.all(
      nodes.map(this.validateNode.bind(this)),
    );
    return this.mergeValidateResult(...results);
  }

  /** merge validation result */
  private mergeValidateResult(...result: ValidateResult[]): ValidateResult {
    const hasError = result.some(item => item.hasError);

    const nodeErrorMap = result.reduce<ValidateErrorMap>(
      (errorMap, nodeValidateResult) => {
        if (!nodeValidateResult.hasError) {
          return errorMap;
        }
        Object.entries(nodeValidateResult.nodeErrorMap).forEach(
          ([nodeId, nodeErrors]) => {
            errorMap[nodeId] = errorMap[nodeId] ?? [];
            errorMap[nodeId].push(...nodeErrors);
          },
        );
        return errorMap;
      },
      {},
    );

    return {
      hasError,
      nodeErrorMap,
    };
  }

  /** check node error */
  private validateNodeError(
    node: WorkflowNodeEntity,
  ): ValidateResult | undefined {
    const invalidError = getNodeError(node);
    if (!invalidError) {
      return;
    }
    return {
      hasError: true,
      nodeErrorMap: {
        [node.id]: [
          {
            errorInfo: invalidError.message,
            errorLevel: 'error',
            errorType: 'node',
            nodeId: node.id,
          },
        ],
      },
    };
  }

  /** Verify Node Form */
  private async validateForm(
    node: WorkflowNodeEntity,
  ): Promise<ValidateResult | undefined> {
    const invalidError = getNodeError(node);
    const formData = node?.getData<FlowNodeFormData>(FlowNodeFormData);

    if (invalidError || !formData.formModel.initialized) {
      return;
    }

    // Node Form Validation
    const feedbacks = await formData.formModel.validateWithFeedbacks();
    const nodeFormError = feedbacks
      .filter(
        feedback =>
          feedback.feedbackStatus === 'warning' ||
          feedback.feedbackStatus === 'error',
      )
      .map(feedback => {
        let feedbackText = feedback.feedbackText || '';
        // The output feedbacks need to be parsed, and there is no good way to judge different feedbacks for the time being.
        try {
          const parsedError = JSON.parse(feedbackText);
          const { issues, name } = parsedError;
          if (name === 'ZodError' && issues?.[0]?.message) {
            feedbackText = issues?.[0].message;
          }
        } catch (e) {
          console.log(e);
        }
        return {
          errorInfo: feedbackText,
          errorLevel: feedback.feedbackStatus,
          errorType: 'node',
          nodeId: node.id,
        };
      }) as ValidateError[];
    const hasError = !!nodeFormError.length;

    this.validatedNodeMap[node.id] = true;

    const formValidateResult: ValidateResult = {
      hasError,
      nodeErrorMap: {
        [node.id]: nodeFormError,
      },
    };

    return formValidateResult;
  }

  /** check subcanvas port */
  private validateSubCanvasPort(
    node: WorkflowNodeEntity,
  ): ValidateResult | undefined {
    const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
    const subCanvas = nodeMeta.subCanvas?.(node);
    if (!subCanvas || !subCanvas.isCanvas) {
      return;
    }
    const { parentNode, canvasNode } = subCanvas;
    const portsData = node.getData<WorkflowNodePortsData>(
      WorkflowNodePortsData,
    );
    const { allPorts: ports } = portsData;
    const inputPort = ports.find(port =>
      String(port.portID).endsWith('function-inline-output'),
    );
    const outputPort = ports.find(port =>
      String(port.portID).endsWith('function-inline-input'),
    );
    if (!inputPort || !outputPort) {
      return;
    }
    const isInputPortEmpty = inputPort.allLines.length === 0;
    const isOutputPortEmpty = outputPort.allLines.length === 0;
    const errors: ValidateError[] = [];
    if (isInputPortEmpty) {
      const errorMessage =
        parentNode.flowNodeType === StandardNodeType.Loop
          ? I18n.t('workflow_testrun_check list_loopbody_start_unconnect')
          : I18n.t('workflow_testrun_check list_batchbody_start_unconnect');
      errors.push({
        errorInfo: errorMessage,
        errorLevel: 'error',
        errorType: 'node',
        nodeId: node.id,
      });
      (
        inputPort as WorkflowPortEntity & {
          errorMessage?: string;
        }
      ).errorMessage = errorMessage;
      inputPort.hasError = true;
    } else {
      inputPort.hasError = false;
    }
    // All leaf nodes are end nodes
    const isAllLeafEnds = canvasNode.collapsedChildren
      .filter(
        childNode =>
          childNode.getData(WorkflowNodeLinesData).outputNodes.length === 0,
      )
      .every(childNode => childNode.getNodeMeta().isNodeEnd);
    if (isOutputPortEmpty && !isAllLeafEnds) {
      const errorMessage =
        parentNode.flowNodeType === StandardNodeType.Loop
          ? I18n.t('workflow_testrun_check list_loopbody_end_unconnect')
          : I18n.t('workflow_testrun_check list_batchbody_end_unconnect');
      errors.push({
        errorInfo: errorMessage,
        errorLevel: 'error',
        errorType: 'node',
        nodeId: node.id,
      });
      (
        outputPort as WorkflowPortEntity & {
          errorMessage?: string;
        }
      ).errorMessage = errorMessage;
      outputPort.hasError = true;
    } else {
      outputPort.hasError = false;
    }
    return {
      hasError: !!errors.length,
      nodeErrorMap: {
        [node.id]: errors,
      },
    };
  }

  /**
   * check exception setting port
   */
  private validateSettingOnErrorPort(
    node: WorkflowNodeEntity,
  ): ValidateResult | undefined {
    const portsData = node.getData<WorkflowNodePortsData>(
      WorkflowNodePortsData,
    );
    const { allPorts: ports } = portsData;
    const settingOnErrorPort = ports.find(
      port => String(port.portID) === SETTING_ON_ERROR_PORT,
    );

    if (!settingOnErrorPort) {
      return;
    }
    const isSettingOnErrorEmpty = settingOnErrorPort.allLines.length === 0;
    const errors: ValidateError[] = [];
    if (isSettingOnErrorEmpty) {
      const errorMessage = I18n.t(
        'workflow_250407_214',
        undefined,
        '需要完善节点的异常处理流程',
      );
      errors.push({
        errorInfo: errorMessage,
        errorLevel: 'error',
        errorType: 'node',
        nodeId: node.id,
      });
      (
        settingOnErrorPort as WorkflowPortEntity & {
          errorMessage?: string;
        }
      ).errorMessage = errorMessage;
      settingOnErrorPort.hasError = true;
    } else {
      settingOnErrorPort.hasError = false;
    }

    return {
      hasError: !!errors.length,
      nodeErrorMap: {
        [node.id]: errors,
      },
    };
  }

  /** Validation canvas schema */
  public async validateSchema() {
    const json = await this.document.toJSON();
    const params =
      this.globalVariable.state.type === 'project'
        ? {
            bind_project_id: this.globalVariable.state.id,
          }
        : {
            bind_bot_id: this.globalVariable.state.id,
          };
    const { data } = await workflowApi.ValidateSchema({
      schema: JSON.stringify(json),
      ...params,
    });
    const hasError = !!data?.length;
    const nodeErrorMap = formatSchemaError2ValidateError(data);

    return {
      hasError,
      nodeErrorMap,
    };
  }

  /** New validation canvas schema */
  public async validateSchemaV2() {
    const params: ValidateTreeRequest = {
      workflow_id: this.globalState.workflowId,
    };
    if (this.globalVariable.state.type === 'project') {
      params.bind_project_id = this.globalVariable.state.id;
    } else {
      params.bind_bot_id = this.globalVariable.state.id;
    }
    const json = await this.document.toJSON();
    const { data } = await workflowApi.ValidateTree({
      schema: JSON.stringify(json),
      ...params,
    });

    const errors = formatSchemaError2WorkflowError(data);
    const hasError = !!Object.keys(errors).length;

    return {
      hasError,
      errors,
    };
  }

  getErrors(id: string) {
    return this.store.getState().errors[id] || [];
  }
  setErrors(errors: ValidateErrorMap, force?: boolean) {
    const prev = this.store.getState().errors;
    const next = force ? errors : { ...prev, ...errors };
    this.store.setState({
      errors: next,
    });
  }
  clearErrors() {
    this.store.setState({ errors: {}, errorsV2: {} });
  }

  setErrorsV2(errors: WorkflowValidateErrorMap) {
    this.store.setState({
      errorsV2: errors,
    });
  }
  isLineError(fromId: string, toId?: string) {
    const errors = this.store.getState().errorsV2;
    /** Find only line errors for this workflow */
    const myErrors = errors[this.globalState.workflowId]?.errors;
    if (!myErrors) {
      return false;
    }
    const nodeErrors = myErrors[fromId] || [];
    const lineError = nodeErrors.find(
      error => error.errorType === 'line' && error.targetNodeId === toId,
    );
    return !!lineError;
  }

  /** Non-responsive, use with caution */
  get validating() {
    return this.store.getState().validating;
  }
  set validating(value: boolean) {
    this.store.setState({
      validating: value,
    });
  }
}
