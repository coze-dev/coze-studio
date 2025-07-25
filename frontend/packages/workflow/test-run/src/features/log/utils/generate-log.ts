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
  /** input 不可能是 string，所以使用 {} 兜底，异常情况直接展示空即可 */
  const inputData = (typeSafeJSONParse(result.input, {
    emptyValue: result.input,
    enableBigInt,
  }) || {}) as LogValueType;
  /** step 1.1: condition 节点单独处理 */
  if (type === 'If') {
    const normalizeConditions = normalizeConditionInputData(inputData);
    const conditions = normalizeConditions.map(branch => ({
      conditions: branch.conditions.map(condition => {
        /** 右值不一定存在 */
        const { left, right = {}, operator } = condition;
        const operatorFn = totalConditionValueMap[operator];
        /** 后端的 operator 枚举值通过 i18n 转化为文本 */
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
    /** end、Message 节点的 label 不同，输入即输出 */
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
   * case1: output 解析成功，可能是对象或者字符串
   * case2: output 解析失败，可能是字符串
   * case3: output 为空值，兜底展示空对象
   */
  let outputData =
    typeSafeJSONParse(result.output, { enableBigInt }) || result.output || {};
  /** step 2.1: 处理 rawOutput */
  /**
   * case1: output 解析成功，可能是对象或者字符串
   * case2: output 解析失败，可能是字符串，由于是原始输出空值也视为有意义
   */
  const rawData =
    typeSafeJSONParse(result.raw_output, { enableBigInt }) || result.raw_output;

  /** Code、Llm 节点需要展示 raw */
  const textHasRawout = type === 'Text' && hasStringOutput(rawData);
  const hasRawOutput =
    (type && ['Code', 'LLM', 'Question'].includes(type)) || textHasRawout;

  /** step 2.2: 处理 errorInfo */
  if (errorInfo) {
    const errorData = {
      [errorLevel === 'Error'
        ? LogObjSpecialKey.Error
        : LogObjSpecialKey.Warning]: errorInfo,
    };
    /**
     * 错误放到 output 中展示，output 的展示优先级最高
     * 若 output 为对象则直接 assign error
     * 否则 output 需要被赋值到 output 字段并和 error 组成一个对象
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

  /** step 0: 处理 batch data */
  if (isBatch) {
    logs.push(generateBatchData(result));
  }

  /** step 1: 处理 input */
  generateInput(logs, result);

  /** step 2: 处理 output */

  generateOutput(logs, result, node);

  /** step 3: 对于子工作流节点，生成额外的跳转链接 */
  generateExternalLink(logs, result, node);

  return {
    logs,
  };
};
