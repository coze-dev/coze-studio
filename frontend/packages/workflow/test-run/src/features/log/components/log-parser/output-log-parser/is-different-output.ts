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
 
import { isEqual, isObject, isUndefined, omit } from 'lodash-es';

import { type LogValueType } from '../../../types';

const REASONING_CONTENT_NAME = 'reasoning_content';

interface isDifferentOutputArgs {
  /** 节点输出 */
  nodeOutput: LogValueType;
  /** 原始输出 */
  rawOutput: LogValueType;
  /** 是否是大模型节点 */
  isLLM?: boolean;
}

/**
 * 通用的节点输出判异
 */
const isDifferentCommonOutput = (args: isDifferentOutputArgs) => {
  const { nodeOutput, rawOutput } = args;
  /**
   * case1: rawOutput === undefined
   * 可以无须比较，直接返回假
   */
  if (isUndefined(rawOutput)) {
    return false;
  }
  const nodeOutputType = typeof nodeOutput;
  const rawOutputType = typeof rawOutput;
  /** case2: 两者类型不同 */
  if (nodeOutputType !== rawOutputType) {
    return true;
  }
  /** case4: 深度比较 */
  return !isEqual(nodeOutput, rawOutput);
};

/**
 * 大模型节点特有的判断逻辑
 */
const isDifferentLLMOutput = (args: isDifferentOutputArgs) => {
  const { nodeOutput } = args;

  /** 如果节点输出是对象，则去除系统字段 */
  const readNodeOutput = isObject(nodeOutput)
    ? omit(nodeOutput, [REASONING_CONTENT_NAME])
    : nodeOutput;
  const isDiffCommon = isDifferentCommonOutput({
    ...args,
    nodeOutput: readNodeOutput,
  });
  /** 常规判断已经判同，则直接返回 */
  if (!isDiffCommon) {
    return isDiffCommon;
  }
  /** 如果不是节点输出不是对象，直接判异 */
  if (!isObject(readNodeOutput)) {
    return true;
  }

  const arr = Object.entries(readNodeOutput);
  /** 如果排除系统字段，仍然超过多个字段，则无须进一步比较，直接判异 */
  if (arr.length !== 1) {
    return true;
  }
  /** 用唯一的值与节点输出做异同判断 */
  return isDifferentCommonOutput({
    ...args,
    nodeOutput: arr[0][1],
  });
};

/**
 * 精细的判断节点输出和原始输出是否相同
 */
export const isDifferentOutput = (
  args: isDifferentOutputArgs,
): [boolean, any] => {
  /**
   * nodeOutput 可能值：
   * 1. undefined
   * 2. string
   * 3. 包涵一个自定义字段、reasoning_content、LogObjSpecialKey
   * 4. 包涵多个自定义字段
   * rawOutput 可能值：
   * 1. undefined
   * 2. string
   * 4. 任意对象
   * 5. 任意数组
   */
  try {
    const { isLLM } = args;
    const result = isLLM
      ? isDifferentLLMOutput(args)
      : isDifferentCommonOutput(args);
    return [result, undefined];
  } catch (err) {
    /** 该函数会深入解析日志结构，不排除出现异常的可能性，出现异常则判异， */
    return [true, err];
  }
};
