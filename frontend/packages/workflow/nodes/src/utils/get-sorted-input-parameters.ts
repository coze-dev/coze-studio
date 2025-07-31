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

import { groupBy, sortBy } from 'lodash-es';
import { type DTODefine } from '@coze-workflow/base';

export type InputVariableDTO = DTODefine.InputVariableDTO;

/**
 * Sort the input parameters, then group them by required fields, and put the required fields at the front
 * @param inputs
 * @param groupKey
 * @param sortKey
 * @returns
 */
export const getSortedInputParameters = <
  T extends { name?: string; required?: boolean },
>(
  inputs: T[],
  groupKey = 'required',
  sortKey = 'name',
): T[] => {
  const processedItems = (inputs || []).map(item => ({
    ...item,
    required: item.required !== undefined ? item.required : false, // Default setting is false
  }));

  // Group by required attributes first
  const grouped = groupBy(processedItems, groupKey);

  // Sort by name attribute within each group
  const sortedTrueGroup = sortBy(grouped.true, sortKey) || [];
  const sortedFalseGroup = sortBy(grouped.false, sortKey) || [];

  // Merge true and false groupings
  const mergedArray = [...sortedTrueGroup, ...sortedFalseGroup];

  return mergedArray;
};
