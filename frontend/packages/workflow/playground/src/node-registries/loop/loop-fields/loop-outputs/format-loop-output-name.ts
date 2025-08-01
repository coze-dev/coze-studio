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

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { ValueExpressionType, type ValueExpression } from '@coze-workflow/base';

import { LoopVariablePrefix } from '../../constants';

export const formatLoopOutputName = (params: {
  name: string;
  prefix: string;
  suffix: string;
  input: ValueExpression;
  node: WorkflowNodeEntity;
}): string => {
  const { name, prefix, suffix, input, node } = params;

  // Non-reference type or non-node own variable, returning the loop body variable name
  if (
    input.type !== ValueExpressionType.REF ||
    input.content?.keyPath?.[0] !== node.id
  ) {
    return `${prefix}${name}${suffix}`;
  }

  // The node itself variable, after removing the prefix, returns
  return name.startsWith(LoopVariablePrefix)
    ? name.slice(LoopVariablePrefix.length)
    : name;
};
