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

import { VARIABLE_TYPE_ALIAS_MAP, ViewVariableType } from '@coze-workflow/base';
import { getFlags } from '@coze-arch/bot-flags';

import { ObjectLikeTypes } from '../../constants';

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

const getFileChildren = () => {
  const FLAGS = getFlags();

  const result = [
    generateVariableOption(ViewVariableType.File, 'Default', 'File'),
    generateVariableOption(ViewVariableType.Image),
    generateVariableOption(ViewVariableType.Doc),
    generateVariableOption(ViewVariableType.Code),
    generateVariableOption(ViewVariableType.Ppt),
    generateVariableOption(ViewVariableType.Txt),
    generateVariableOption(ViewVariableType.Excel),
    generateVariableOption(ViewVariableType.Audio),
    generateVariableOption(ViewVariableType.Zip),
    generateVariableOption(ViewVariableType.Video),
    generateVariableOption(ViewVariableType.Svg),
  ];

  // 1. 是否开启了auto start节点支持音色字段能力
  // 2. 是否开启了语音资源功能
  // 开源版暂不支持该功能
  if (
    FLAGS['bot.automation.start_support_voice'] &&
    FLAGS['bot.studio.library_voice_resource']
  ) {
    result.push(generateVariableOption(ViewVariableType.Voice));
  }

  return result;
};

export const allVariableTypeList: Array<VariableTypeOption> = [
  generateVariableOption(ViewVariableType.String),
  {
    value: '$file-category',
    label: 'File',
    children: getFileChildren(),
  },
  generateVariableOption(ViewVariableType.Integer),
  generateVariableOption(ViewVariableType.Boolean),
  generateVariableOption(ViewVariableType.Number),
  generateVariableOption(ViewVariableType.Time),
  generateVariableOption(ViewVariableType.Object),
  generateVariableOption(ViewVariableType.ArrayString),
  {
    value: '$file-array-category',
    label: 'Array<File>',
    children: [
      generateVariableOption(
        ViewVariableType.ArrayFile,
        'Default',
        'Array<File>',
      ),
      generateVariableOption(ViewVariableType.ArrayImage),
      generateVariableOption(ViewVariableType.ArrayDoc),
      generateVariableOption(ViewVariableType.ArrayCode),
      generateVariableOption(ViewVariableType.ArrayPpt),
      generateVariableOption(ViewVariableType.ArrayTxt),
      generateVariableOption(ViewVariableType.ArrayExcel),
      generateVariableOption(ViewVariableType.ArrayAudio),
      generateVariableOption(ViewVariableType.ArrayZip),
      generateVariableOption(ViewVariableType.ArrayVideo),
      generateVariableOption(ViewVariableType.ArraySvg),
    ],
  },
  generateVariableOption(ViewVariableType.ArrayInteger),
  generateVariableOption(ViewVariableType.ArrayBoolean),
  generateVariableOption(ViewVariableType.ArrayNumber),
  generateVariableOption(ViewVariableType.ArrayObject),
  generateVariableOption(ViewVariableType.ArrayTime),
];

const filterTypes = (
  list: Array<VariableTypeOption>,
  options?: VariableListOptions,
): Array<VariableTypeOption> => {
  const { disabledTypes = [], hiddenTypes = [], level } = options || {};

  return list.reduce((pre, cur) => {
    const newOption = { ...cur };

    if (newOption.children) {
      newOption.children = filterTypes(newOption.children, options);
    }

    /**
     * 1. 命中 hideType 时隐藏
     * 2. 有 children，但 children 全隐藏时，父级也隐藏
     * 3. File类型不允许嵌套
     */
    const hidden =
      hiddenTypes.some(type => type === newOption.value) ||
      newOption.children?.length === 0 ||
      (level &&
        level >= 1 &&
        ViewVariableType.isFileType(newOption.value as ViewVariableType));

    /**
     * 1. 命中 disabledTypes 时禁用
     * 2. 到达层级限制时禁用 ObjectLike 类型，避免嵌套过深
     */
    const disabled = Boolean(
      disabledTypes?.includes(Number(newOption.value)) ||
        (level &&
          level >= LEVEL_LIMIT &&
          ObjectLikeTypes.includes(Number(newOption.value))),
    );

    if (hidden) {
      return pre;
    }

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
  disabledTypes?: Array<ViewVariableType>;
  hiddenTypes?: Array<ViewVariableType>;
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
