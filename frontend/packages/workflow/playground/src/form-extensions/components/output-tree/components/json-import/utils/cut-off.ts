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

import { ViewVariableType } from '@coze-workflow/base';
import {
  traverse,
  type TraverseContext,
  type TraverseHandler,
} from '@coze-workflow/base';

import type { TreeNodeCustomData } from '../../custom-tree-node/type';

const isOutputValueContext = (context: TraverseContext): boolean => {
  if (
    typeof context.node.value !== 'object' ||
    typeof context.node.value.type === 'undefined'
  ) {
    return false;
  } else {
    return true;
  }
};

const cutOffNameLength =
  (length: number): TraverseHandler =>
  (context: TraverseContext): void => {
    if (!isOutputValueContext(context)) {
      return;
    }
    if (context.node.value.name.length > length) {
      context.node.value.name = context.node.value.name.slice(0, length);
    }
  };

const cutOffDepth =
  (depth: number): TraverseHandler =>
  (context: TraverseContext): void => {
    if (
      !isOutputValueContext(context) ||
      context.node.value.level !== depth ||
      ![ViewVariableType.Object, ViewVariableType.ArrayObject].includes(
        context.node.value.type,
      )
    ) {
      return;
    }
    context.deleteSelf();
  };

const cutOffDisabledTypes =
  (params: { disabledTypes: ViewVariableType[]; isBatch: boolean }) =>
  (context: TraverseContext): void => {
    const { disabledTypes, isBatch } = params;
    if (
      !isOutputValueContext(context) ||
      !disabledTypes.includes(context.node.value.type)
    ) {
      return;
    }
    if (isBatch && context.node.value.level === 0) {
      return;
    }
    context.deleteSelf();
  };

export const cutOffInvalidData = (params: {
  data: TreeNodeCustomData[];
  isBatch: boolean;
  disabledTypes: ViewVariableType[];
  allowDepth: number;
  allowNameLength: number;
}): TreeNodeCustomData[] => {
  const { data, isBatch, disabledTypes, allowDepth, allowNameLength } = params;
  const cutOffDisabledTypesHandler = cutOffDisabledTypes({
    disabledTypes,
    isBatch,
  });
  return traverse<TreeNodeCustomData[]>(data, [
    cutOffNameLength(allowNameLength),
    cutOffDepth(allowDepth),
    cutOffDisabledTypesHandler,
  ]);
};
