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
 
import { type ReactNode } from 'react';

import { VARIABLE_TYPE_ALIAS_MAP } from '@/types/view-variable-tree';
import { ObjectLikeTypes } from '@/store/variable-groups/types';
import { ViewVariableType } from '@/store';

const LEVEL_LIMIT = 3;

export const generateVariableOption = (
  type: ViewVariableType,
  label?: string,
  display?: string,
) => ({
  value: Number(type),
  label: label || VARIABLE_TYPE_ALIAS_MAP[type],
  display: display || label || VARIABLE_TYPE_ALIAS_MAP[type],
});

export interface VariableTypeOption {
  // 类型的值， 非叶子节点时可能为空
  value: number | string;
  // 选项的展示名称
  label: ReactNode;
  // 回显的展示名称
  display?: string;
  // 类型是否禁用
  disabled?: boolean;
  // 子类型
  children?: VariableTypeOption[];
}

export const allVariableTypeList: Array<VariableTypeOption> = [
  generateVariableOption(ViewVariableType.String),
  generateVariableOption(ViewVariableType.Integer),
  generateVariableOption(ViewVariableType.Boolean),
  generateVariableOption(ViewVariableType.Number),
  generateVariableOption(ViewVariableType.Object),
  generateVariableOption(ViewVariableType.ArrayString),
  generateVariableOption(ViewVariableType.ArrayInteger),
  generateVariableOption(ViewVariableType.ArrayBoolean),
  generateVariableOption(ViewVariableType.ArrayNumber),
  generateVariableOption(ViewVariableType.ArrayObject),
];

const filterTypes = (
  list: Array<VariableTypeOption>,
  options?: VariableListOptions,
): Array<VariableTypeOption> => {
  const { level } = options || {};

  return list.reduce((pre, cur) => {
    const newOption = { ...cur };

    if (newOption.children) {
      newOption.children = filterTypes(newOption.children, options);
    }

    /**
     * 1. 到达层级限制时禁用 ObjectLike 类型，避免嵌套过深
     */
    const disabled = Boolean(
      level &&
        level >= LEVEL_LIMIT &&
        ObjectLikeTypes.includes(Number(newOption.value)),
    );

    return [
      ...pre,
      {
        ...newOption,
        disabled,
      },
    ];
  }, [] as Array<VariableTypeOption>);
};

interface VariableListOptions {
  level?: number;
}

export const getVariableTypeList = options =>
  filterTypes(allVariableTypeList, options);

/**
 * 获取类型在选项列表中的路径，作为 cascader 的 value
 */
export const getCascaderVal = (
  originalVal: ViewVariableType,
  list: Array<VariableTypeOption>,
  path: Array<string | number> = [],
) => {
  let valuePath = [...path];
  list.forEach(item => {
    if (item.children) {
      const childPath = getCascaderVal(originalVal, item.children, [
        ...valuePath,
        item.value,
      ]);
      if (childPath[childPath.length - 1] === originalVal) {
        valuePath = childPath;
        return;
      }
    } else if (item.value === originalVal) {
      valuePath.push(originalVal);
      return;
    }
  });

  return valuePath;
};
