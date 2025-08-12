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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
import { isString } from 'lodash-es';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import {
  type NodeResultExtractorParser,
  type NodeResultExtracted,
  type CaseResultData,
} from '../type';
import { parseImagesFromOutputData } from '../../output-image-parser';
import { StandardNodeType, type WorkflowNodeJSON } from '../../../types';
import { type NodeResult, TerminatePlanType } from '../../../api';

export const defaultParser: NodeResultExtractorParser = (
  nodeResult,
  workflowSchema,
): NodeResultExtracted => {
  const { nodeId, isBatch, batch } = nodeResult;
  const node = workflowSchema.nodes.find(it => it.id === nodeId);
  const nodeType = node?.type as StandardNodeType;
  if (!isBatch) {
    return {
      nodeId,
      nodeType,
      isBatch,
      caseResult: [parseData(nodeResult, node)],
    };
  }
  const batchNodeResult = typeSafeJSONParse(batch) as NodeResult[];
  const caseResult = (batchNodeResult
    ?.filter(Boolean)
    ?.map(item => parseData(item, node, isBatch))
    ?.filter(Boolean) || []) as CaseResultData[];
  return {
    nodeId,
    nodeType,
    isBatch,
    caseResult,
  };
};

const parseData = (
  nodeResult: NodeResult,
  nodeSchema?: WorkflowNodeJSON,
  isBatch = false,
): CaseResultData => {
  const { input, output, raw_output: rawOutput, extra, items } = nodeResult;

  const dataList: CaseResultData['dataList'] = [];

  const inputAsOutput = [
    StandardNodeType.End,
    StandardNodeType.Output,
  ].includes(nodeSchema?.type as StandardNodeType);

  if (isBatch) {
    dataList.push({
      title: '本次批处理变量',
      data: typeSafeJSONParse(items),
    });
  }
  if (!inputAsOutput) {
    dataList.push({
      title: '输入',
      data: typeSafeJSONParse(input) || input?.toString?.(),
    });
  }

  const finalOutput = inputAsOutput ? input : output;
  const outputData =
    typeSafeJSONParse(finalOutput) || finalOutput?.toString?.();

  const textHasRawout =
    nodeSchema?.type === StandardNodeType.Text &&
    isString(rawOutput) &&
    rawOutput?.length > 0;
  // The raw_out of the text node does not need to be deserialized, it must be a string, badcase: the json string spliced by the user such as '{}'、' 123 'will become object and number after deserialization
  const rawOutputData = textHasRawout
    ? rawOutput?.toString?.()
    : rawOutput
    ? typeSafeJSONParse(rawOutput) || rawOutput?.toString?.()
    : undefined;

  /** Code, Llm nodes need to display raw */
  const hasRawOutput =
    (Boolean(nodeSchema?.type) &&
      [
        StandardNodeType.Code,
        StandardNodeType.LLM,
        StandardNodeType.Question,
      ].includes(nodeSchema?.type as StandardNodeType)) ||
    textHasRawout;
  // Start and Input nodes only display input
  const hasOutput =
    nodeSchema?.type !== StandardNodeType.Start &&
    nodeSchema?.type !== StandardNodeType.Input;
  if (hasOutput) {
    hasRawOutput &&
      rawOutputData &&
      dataList.push({
        title: '原始输出',
        data: rawOutputData,
      });
    const outputTitle = inputAsOutput
      ? '输出变量'
      : rawOutputData
      ? '最终输出'
      : '输出';
    outputData &&
      dataList.push({
        title: outputTitle,
        data: outputData,
      });
  }

  if (nodeSchema?.type === StandardNodeType.End) {
    const isReturnText =
      (typeSafeJSONParse(extra) as any)?.response_extra?.terminal_plan ===
      TerminatePlanType.USESETTING;
    if (isReturnText) {
      dataList.push({
        title: '回答内容',
        data: typeSafeJSONParse(output) || output?.toString?.(),
      });
    }
  } else if (nodeSchema?.type === StandardNodeType.Output) {
    dataList.push({
      title: '回答内容',
      data: typeSafeJSONParse(output) || output?.toString?.(),
    });
  }

  const outputJsonString = finalOutput ?? '';
  return {
    dataList,
    imgList: parseImagesFromOutputData({
      // The output of batch data is drilled down one layer, and another layer needs to be wrapped to be consistent with the schema of the output.
      outputData: isBatch
        ? {
            outputList: [typeSafeJSONParse(outputJsonString)].filter(Boolean),
          }
        : typeSafeJSONParse(outputJsonString),
      nodeSchema,
    }),
  };
};
