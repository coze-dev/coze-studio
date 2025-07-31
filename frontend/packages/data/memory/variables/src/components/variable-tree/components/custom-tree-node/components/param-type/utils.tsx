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
  // Value of type, possibly empty when not a leaf node
  value: number | string;
  // The display name of the option
  label: ReactNode;
  // Echoed display name
  display?: string;
  // Is the type disabled?
  disabled?: boolean;
  // subtype
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
     * 1. Disable the ObjectLike type when reaching the level limit to avoid too deep nesting
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
 * Get the path of the type in the options list as the cascader value
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
