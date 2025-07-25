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
/* eslint-disable max-lines-per-function */
import { isFunction, isObject, isString } from 'lodash-es';
import type { NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { MockHitStatus } from '@coze-arch/bot-api/debugger_api';
import { LogObjSpecialKey } from '@coze-common/json-viewer';

import { ConditionRightType, type LogValueType } from '../types';
import { EndTerminalPlan } from '../constants';
import { logicTextMap } from '../../../form-extensions/setters/condition/multi-condition/constants';
import { totalConditionValueMap } from '../../../form-extensions/setters/condition/multi-condition/condition-params-item/constants';

interface MockInfo {
  isHit: boolean;
  mockSetName?: string;
}

/** 通常的日志结构 */
interface BaseLog {
  label: string;
  source: LogValueType;
  data: LogValueType;
  copyTooltip?: string;
  mockInfo?: MockInfo;
}
/** condition 的日志结构 */
interface ConditionLog {
  conditions: Array<{
    conditions: {
      leftData: LogValueType;
      rightData: LogValueType;
      operatorData: string;
    }[];
    name: string;
    logic: number;
    logicData: string;
  }>;
}

/** 嵌套的日志结构 */
interface TreeLog {
  label: string;
  children: (BaseLog | ConditionLog)[];
}

export type Log = BaseLog | ConditionLog | TreeLog;

const isConditionLog = (log: Log): log is ConditionLog =>
  !!(log as ConditionLog).conditions;
const isTreeLog = (log: Log): log is TreeLog => !!(log as TreeLog).children;

const generateBatchData = (result: NodeResult): Log => {
  const batchData = safeJSONParse(result.items, {});
  return {
    label: I18n.t('workflow_detail_testrun_panel_batch_value'),
    source: result.items,
    data: batchData,
    copyTooltip: I18n.t('workflow_detail_title_testrun_copy_batch'),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeConditionInputData = (inputData: any) => {
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
};

const hasStringOutput = (rawData: unknown) =>
  isString(rawData) && rawData.length > 0;

const generateLog = (
  result: NodeResult | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeData?: any,
): {
  logs: Log[];
} => {
  if (!result) {
    return { logs: [] };
  }
  const { NodeType: type, errorInfo, errorLevel, isBatch, extra } = result;

  const { mock_hit_status: mockHitInfo } =
    safeJSONParse(extra)?.response_extra || {};

  const { hitStatus: mockHitStatus, mockSetName } =
    safeJSONParse(mockHitInfo) || {};

  const logs: Log[] = [];

  /** step 0: 处理 batch data */
  if (isBatch) {
    logs.push(generateBatchData(result));
  }

  /** step 1: 处理 input */

  /** input 不可能是 string，所以使用 {} 兜底，异常情况直接展示空即可 */
  const inputData = safeJSONParse(result.input, {});
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
          right.type === ConditionRightType.Ref && right.key
            ? { [right.key]: right.value }
            : right.value;
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
    logs.push({ conditions });
  } else {
    /** end、Message 节点的 label 不同，输入即输出 */
    const isEnd = type === 'End';
    const isMsg = type === 'Message';
    const label =
      isEnd || isMsg
        ? I18n.t('workflow_detail_end_output')
        : I18n.t('workflow_detail_node_input');
    const copyTooltip = isEnd
      ? I18n.t('workflow_detail_end_output_copy')
      : I18n.t('workflow_detail_title_testrun_copyinput');
    logs.push({
      label,
      source: inputData,
      data: inputData,
      copyTooltip,
    });
  }

  /** step 2: 处理 output */

  /**
   * case1: output 解析成功，可能是对象或者字符串
   * case2: output 解析失败，可能是字符串
   * case3: output 为空值，兜底展示空对象
   */
  let outputData = safeJSONParse(result.output, result.output || {});
  /** step 2.1: 处理 rawOutput */
  /**
   * case1: output 解析成功，可能是对象或者字符串
   * case2: output 解析失败，可能是字符串，由于是原始输出空值也视为有意义
   */
  let rawData = safeJSONParse(result.raw_output, result.raw_output);

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
    /** 如果需要展示 raw & 有错误 & raw 是通常意义上的空（""、null等）则错误信息展示在 raw 上 */
    if (hasRawOutput && !rawData) {
      rawData = errorData;
    } else {
      /**
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
  }

  const finalOutputLog: BaseLog = {
    label: I18n.t('workflow_detail_node_output'),
    source: outputData,
    data: outputData,
    copyTooltip: I18n.t('workflow_detail_title_testrun_copyoutput'),
    mockInfo: {
      isHit: mockHitStatus === MockHitStatus.Success,
      mockSetName,
    },
  };

  if (hasRawOutput) {
    logs.push({
      label: I18n.t('workflow_detail_node_output'),
      children: [
        {
          label: I18n.t('workflow_detail_testrun_panel_raw_output'),
          source: rawData,
          data: rawData,
          copyTooltip: I18n.t('workflow_detail_title_testrun_copyoutput'),
        },
        {
          ...finalOutputLog,
          label: I18n.t('workflow_detail_testrun_panel_final_output'),
        },
      ],
    });
  } else if (type === 'End') {
    const isReturnText =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safeJSONParse((result as unknown as any).extra, {})?.response_extra
        ?.terminal_plan === EndTerminalPlan.Text;
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

  const { current_sub_execute_id: executeId, subExecuteID } =
    safeJSONParse(extra) || {};

  // 只有运维平台才需要额外展示执行ID相关信息
  if (IS_BOT_OP && type === 'SubWorkflow' && (executeId || subExecuteID)) {
    // 通过正则提取 current_sub_execute_id，上边的参数会精度丢失
    const currentSubExecuteIdRegex = /"current_sub_execute_id":\s*(\d+)/;
    const currentSubExecuteIdMatch = (extra || '').match(
      currentSubExecuteIdRegex,
    );
    const currentSubExecuteId = currentSubExecuteIdMatch
      ? currentSubExecuteIdMatch[1]
      : null;

    // 通过正则提取 subExecuteID，，上边的参数会精度丢失
    const subExecuteIdRegex = /"subExecuteID":\s*(\d+)/;
    const subExecuteIdMatch = (extra || '').match(subExecuteIdRegex);
    const subExecuteId = subExecuteIdMatch ? subExecuteIdMatch[1] : null;

    const workflowId = nodeData?.inputs?.workflowId;

    logs.push({
      label: '执行 ID 信息',
      source: JSON.stringify({
        workflowId,
        executeId: currentSubExecuteId,
        subExecuteID: subExecuteId,
      }),
      data: {
        workflowId,
        executeId: currentSubExecuteId,
        subExecuteID: subExecuteId,
      },
      copyTooltip: '复制执行 ID 信息',
    });
  }

  return {
    logs,
  };
};

export { generateLog, isConditionLog, isTreeLog };
