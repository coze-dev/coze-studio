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

import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';

import { getVariableInfoFromExpression } from '../variable-support/utils';

interface Options {
  required?: boolean;
  emptyMessage?: string;
  invalidMessage?: string;
}

export const expressionStringValidator = (
  expressionStr: string,
  { node }: NodeFormContext,
  options: Options,
) => {
  const { required = true, emptyMessage, invalidMessage } = options;
  const doubleBracedPattern = /{{([^}]+)}}/g;
  const matches = expressionStr?.match(doubleBracedPattern);
  // Remove {{}} from string
  const matchesContent = matches?.map((varStr: string) =>
    varStr.replace(/^{{|}}$/g, ''),
  );
  let hasInvalidVar = false;
  matchesContent?.forEach((varStr: string) => {
    const { fieldKeyPath } = getVariableInfoFromExpression(varStr);
    const workflowVariable =
      node.context.variableService.getWorkflowVariableByKeyPath(fieldKeyPath, {
        node,
      });

    if (!workflowVariable) {
      hasInvalidVar = true;
    }
  });

  if (required && !expressionStr) {
    return emptyMessage;
  } else if (hasInvalidVar) {
    return invalidMessage;
  }
  return;
};

export const createEexpressionStringValidator =
  ({ required, emptyMessage, invalidMessage }: Options) =>
  ({ value, context }) =>
    expressionStringValidator(value, context, {
      required,
      emptyMessage,
      invalidMessage,
    });
