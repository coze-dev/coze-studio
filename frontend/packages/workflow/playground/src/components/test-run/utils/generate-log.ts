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

/** Normal log structure */
interface BaseLog {
  label: string;
  source: LogValueType;
  data: LogValueType;
  copyTooltip?: string;
  mockInfo?: MockInfo;
}
/** Log structure for conditions */
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

/** Nested log structure */
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

  /** Step 0: Processing batch data */
  if (isBatch) {
    logs.push(generateBatchData(result));
  }

  /** Step 1: Process the input */

  /** The input cannot be a string, so use {} to cover the bottom, and the exception can be directly displayed empty. */
  const inputData = safeJSONParse(result.input, {});
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
    /** Different labels of end and message nodes, input is output */
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

  /** Step 2: Process the output */

  /**
   * Case1: output parsed successfully, may be an object or string
   * Case2: output parsing failed, possibly string
   * Case3: output is null, the empty object is displayed at the bottom
   */
  let outputData = safeJSONParse(result.output, result.output || {});
  /** Step 2.1: Handling rawOutput */
  /**
   * Case1: output parsed successfully, may be an object or string
   * Case2: output parsing failed, it may be a string, because it is the original output null value, it is also considered meaningful
   */
  let rawData = safeJSONParse(result.raw_output, result.raw_output);

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
    /** If raw needs to be displayed & there is an error & raw is empty in the usual sense (", null, etc.), the error message is displayed on raw */
    if (hasRawOutput && !rawData) {
      rawData = errorData;
    } else {
      /**
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

  // Only the operation and maintenance platform needs to display additional information about the execution ID.
  if (IS_BOT_OP && type === 'SubWorkflow' && (executeId || subExecuteID)) {
    // By regular extraction current_sub_execute_id, the above parameters will lose accuracy
    const currentSubExecuteIdRegex = /"current_sub_execute_id":\s*(\d+)/;
    const currentSubExecuteIdMatch = (extra || '').match(
      currentSubExecuteIdRegex,
    );
    const currentSubExecuteId = currentSubExecuteIdMatch
      ? currentSubExecuteIdMatch[1]
      : null;

    // By regular extraction of subExecuteID, the accuracy of the parameters above will be lost
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
