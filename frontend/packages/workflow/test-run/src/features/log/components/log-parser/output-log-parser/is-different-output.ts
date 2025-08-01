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
  /** Node output */
  nodeOutput: LogValueType;
  /** raw output */
  rawOutput: LogValueType;
  /** Is it a large model node? */
  isLLM?: boolean;
}

/**
 * General Node Output Decision
 */
const isDifferentCommonOutput = (args: isDifferentOutputArgs) => {
  const { nodeOutput, rawOutput } = args;
  /**
   * case1: rawOutput === undefined
   * You can directly return to the fake without comparison.
   */
  if (isUndefined(rawOutput)) {
    return false;
  }
  const nodeOutputType = typeof nodeOutput;
  const rawOutputType = typeof rawOutput;
  /** Case2: The two types are different */
  if (nodeOutputType !== rawOutputType) {
    return true;
  }
  /** Case4: Depth comparison */
  return !isEqual(nodeOutput, rawOutput);
};

/**
 * The Unique Judgment Logic of Large Model Nodes
 */
const isDifferentLLMOutput = (args: isDifferentOutputArgs) => {
  const { nodeOutput } = args;

  /** If the node output is an object, remove the system field */
  const readNodeOutput = isObject(nodeOutput)
    ? omit(nodeOutput, [REASONING_CONTENT_NAME])
    : nodeOutput;
  const isDiffCommon = isDifferentCommonOutput({
    ...args,
    nodeOutput: readNodeOutput,
  });
  /** If the conventional judgment has been approved, it will return directly. */
  if (!isDiffCommon) {
    return isDiffCommon;
  }
  /** If it is not a node, the output is not an object, and the direct judgment is */
  if (!isObject(readNodeOutput)) {
    return true;
  }

  const arr = Object.entries(readNodeOutput);
  /** If the system field is excluded and there are still more than one field, there is no need for further comparison and a direct judgment is made */
  if (arr.length !== 1) {
    return true;
  }
  /** Use unique values to judge similarities and differences with node outputs */
  return isDifferentCommonOutput({
    ...args,
    nodeOutput: arr[0][1],
  });
};

/**
 * Fine determination of whether the node output and the original output are the same
 */
export const isDifferentOutput = (
  args: isDifferentOutputArgs,
): [boolean, any] => {
  /**
   * Possible nodeOutput values:
   * 1. undefined
   * 2. string
   * 3. Includes a custom field, reasoning_content, LogObjSpecialKey
   * 4. Include multiple custom fields
   * rawOutput possible values:
   * 1. undefined
   * 2. string
   * 4. Any object
   * 5. Arbitrary array
   */
  try {
    const { isLLM } = args;
    const result = isLLM
      ? isDifferentLLMOutput(args)
      : isDifferentCommonOutput(args);
    return [result, undefined];
  } catch (err) {
    /** This function will deeply analyze the log structure and do not rule out the possibility of abnormalities. */
    return [true, err];
  }
};
