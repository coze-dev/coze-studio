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

import { isFunction, isString, isObject } from 'lodash-es';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import type { NodeResult } from '@coze-workflow/base/api';
import { type StandardNodeType } from '@coze-workflow/base';
import { LogObjSpecialKey } from '@coze-common/json-viewer';
import { I18n } from '@coze-arch/i18n';
import { MockHitStatus } from '@coze-arch/bot-api/debugger_api';

import { type Log, type LogValueType, type OutputLog } from '../types';
import {
  totalConditionValueMap,
  ConditionRightType,
  logicTextMap,
  EndTerminalPlan,
  LogType,
} from '../constants';
import { typeSafeJSONParse } from '../../../utils';
import { generateLLMOutput } from './generate-llm-output';

const enableBigInt = true;
const hasStringOutput = (rawData: unknown) =>
  isString(rawData) && rawData.length > 0;

const normalizeConditionInputData = (inputData: any) => {
  try {
    const { branches, conditions, logic } = inputData;
    if (branches) {
      return branches;
    }
    if (conditions) {
      return [
        {
          conditions,
          logic,
        },
      ];
    }
    return [];
  } catch (_e) {
    return [];
  }
};

const generateBatchData = (result: NodeResult): Log => {
  const batchData =
    typeSafeJSONParse(result.items, {
      enableBigInt,
    }) || {};
  return {
    label: I18n.t('workflow_detail_testrun_panel_batch_value'),
    data: batchData,
    copyTooltip: I18n.t('workflow_detail_title_testrun_copy_batch'),
    type: LogType.Batch,
  };
};

const generateInput = (logs: Log[], result: NodeResult) => {
  const { NodeType: type } = result;
  /** The input cannot be a string, so use {} to cover the bottom, and the exception can be directly displayed empty. */
  const inputData = (typeSafeJSONParse(result.input, {
    emptyValue: result.input,
    enableBigInt,
  }) || {}) as LogValueType;
  /** Step 1.1: condition node handled separately */
  if (type === 'If') {
    const normalizeConditions = normalizeConditionInputData(inputData);
    const conditions = normalizeConditions.map(branch => ({
      conditions: branch.conditions.map(condition => {
        /** An rvalue doesn't necessarily exist */
        const { left, right = {}, operator } = condition;
        const operatorFn = totalConditionValueMap[operator];
        /** Back-end operator enumeration values are converted to text via i18n */
        const operatorData = isFunction(operatorFn) ? operatorFn() : operator;
        const leftData = left?.key ? { [left?.key]: left?.value } : left?.value;
        const rightData =
          right?.type === ConditionRightType.Ref && right?.key
            ? { [right?.key]: right?.value }
            : right?.value;
        return {
          ...condition,
          operatorData,
          leftData,
          rightData,
        };
      }),
      logic: branch.logic,
      logicData: logicTextMap.get(branch.logic),
      name: branch.name,
    }));
    logs.push({ conditions, type: LogType.Condition });
  } else {
    /** Different labels of end and message nodes, input is output */
    const isOutputNode = type === 'End' || type === 'Message';
    const label = isOutputNode
      ? I18n.t('workflow_detail_end_output')
      : I18n.t('workflow_detail_node_input');
    const copyTooltip = isOutputNode
      ? I18n.t('workflow_detail_end_output_copy')
      : I18n.t('workflow_detail_title_testrun_copyinput');
    logs.push({
      label,
      data: inputData,
      copyTooltip,
      type: isOutputNode ? LogType.Output : LogType.Input,
      emptyPlaceholder: I18n.t(
        'workflow_testrun_input_form_empty',
        undefined,
        '本次试运行无需输入',
      ),
    });
  }
};

const generateOutput = (
  logs: Log[],
  result: NodeResult,
  node?: FlowNodeEntity,
) => {
  const { NodeType: type, errorInfo, errorLevel, extra } = result;
  const responseExtra = (typeSafeJSONParse(extra) as any)?.response_extra || {};
  const { mock_hit_status: mockHitInfo } = responseExtra;

  const { hitStatus: mockHitStatus, mockSetName } =
    (typeSafeJSONParse(mockHitInfo) as any) || {};
  /**
   * Case1: output parsed successfully, may be an object or string
   * Case2: output parsing failed, possibly string
   * Case3: output is null, the empty object is displayed at the bottom
   */
  let outputData =
    typeSafeJSONParse(result.output, { enableBigInt }) || result.output || {};
  /** Step 2.1: Handling rawOutput */
  /**
   * Case1: output parsed successfully, may be an object or string
   * Case2: output parsing failed, it may be a string, because it is the original output null value, it is also considered meaningful
   */
  const rawData =
    typeSafeJSONParse(result.raw_output, { enableBigInt }) || result.raw_output;

  /** Code, Llm nodes need to display raw */
  const textHasRawout = type === 'Text' && hasStringOutput(rawData);
  const hasRawOutput =
    (type && ['Code', 'LLM', 'Question'].includes(type)) || textHasRawout;

  /** Step 2.2: Handling errorInfo */
  if (errorInfo) {
    const errorData = {
      [errorLevel === 'Error'
        ? LogObjSpecialKey.Error
        : LogObjSpecialKey.Warning]: errorInfo,
    };
    /**
     * Errors are displayed in output, and output has the highest priority
     * If the output is an object, directly assign error
     * Otherwise, output needs to be assigned to the output field and formed into an object with error
     */
    outputData = isObject(outputData)
      ? {
          ...outputData,
          ...errorData,
        }
      : { output: outputData, ...errorData };
  }

  const finalOutputLog: OutputLog = {
    label: I18n.t('workflow_detail_node_output'),
    data: outputData,
    copyTooltip: I18n.t('workflow_detail_title_testrun_copyoutput'),
    nodeType: type || '',
    mockInfo: {
      isHit: mockHitStatus === MockHitStatus.Success,
      mockSetName,
    },
    rawOutput: hasRawOutput
      ? {
          data: rawData,
        }
      : undefined,
    type: LogType.Output,
  };

  if (type === 'LLM') {
    generateLLMOutput(logs, responseExtra, node);
  }

  if (type === 'End') {
    const isReturnText =
      (typeSafeJSONParse((result as unknown as any).extra, {}) as any)
        ?.response_extra?.terminal_plan === EndTerminalPlan.Text;
    if (isReturnText || errorInfo) {
      logs.push({
        ...finalOutputLog,
        label: I18n.t('workflow_detail_end_answer'),
        copyTooltip: I18n.t('workflow_detail_end_answer_copy'),
      });
    }
  } else if (type === 'Message') {
    logs.push({
      ...finalOutputLog,
      label: I18n.t('workflow_detail_end_answer'),
      copyTooltip: I18n.t('workflow_detail_end_answer_copy'),
    });
  } else if (type !== 'Start') {
    logs.push(finalOutputLog);
  }
};

function getSubWorkflowId(node?: FlowNodeEntity) {
  const nodeData = node?.getData<WorkflowNodeData>(WorkflowNodeData);

  if (!nodeData) {
    return '';
  }

  return nodeData.getNodeData<StandardNodeType.SubWorkflow>()?.workflow_id;
}

function generateExternalLink(
  logs: Log[],
  result: NodeResult,
  node?: FlowNodeEntity,
) {
  const subWorkflowId = node ? getSubWorkflowId(node) : '';
  const { NodeType: type, executeId, subExecuteId } = result;
  if (type !== 'SubWorkflow') {
    return;
  }

  logs.push({
    label: I18n.t('workflow_subwf_jump_detail'),
    type: LogType.WorkflowLink,
    data: {
      workflowId: subWorkflowId,
      executeId,
      subExecuteId,
    },
  });
}

export const generateLog = (
  result: NodeResult | null | undefined,
  node?: FlowNodeEntity,
): {
  logs: Log[];
} => {
  if (!result) {
    return { logs: [] };
  }
  const { isBatch } = result;

  const logs: Log[] = [];

  /** Step 0: Processing batch data */
  if (isBatch) {
    logs.push(generateBatchData(result));
  }

  /** Step 1: Process the input */
  generateInput(logs, result);

  /** Step 2: Process the output */

  generateOutput(logs, result, node);

  /** Step 3: For child workflow nodes, generate additional jump links */
  generateExternalLink(logs, result, node);

  return {
    logs,
  };
};
