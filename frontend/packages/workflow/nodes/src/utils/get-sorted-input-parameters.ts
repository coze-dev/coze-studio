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
 * 对输入参数进行排序，然后按照 required 字段进行分组，必填的放最前边
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
    required: item.required !== undefined ? item.required : false, // 默认设置为 false
  }));

  // 先按照 required 属性分组
  const grouped = groupBy(processedItems, groupKey);

  // 在每个组内按照 name 属性进行排序
  const sortedTrueGroup = sortBy(grouped.true, sortKey) || [];
  const sortedFalseGroup = sortBy(grouped.false, sortKey) || [];

  // 合并 true 分组和 false 分组
  const mergedArray = [...sortedTrueGroup, ...sortedFalseGroup];

  return mergedArray;
};
