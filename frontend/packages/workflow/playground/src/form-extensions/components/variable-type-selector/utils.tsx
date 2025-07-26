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

import { ObjectLikeTypes } from '@/form-extensions/components/output-tree/components/custom-tree-node/constants';

const LEVEL_LIMIT = 3;

export const generateVariableOption = ({
  type,
  label,
  display,
  parentPath,
}: {
  type: ViewVariableType;
  label?: string;
  display?: string;
  parentPath?: Array<number | string>;
}) => {
  let targetLabel: string;
  if (label) {
    targetLabel = label;
  } else if (ViewVariableType.isArrayType(type)) {
    const subType = ViewVariableType.getArraySubType(type);
    targetLabel = VARIABLE_TYPE_ALIAS_MAP[subType];
  } else {
    targetLabel = VARIABLE_TYPE_ALIAS_MAP[type];
  }
  return {
    value: Number(type),
    label: targetLabel,
    display: display || label || VARIABLE_TYPE_ALIAS_MAP[type],
    path: [...(parentPath ?? []), type],
  };
};

export const VARIABLE_TYPE_DIVIDER = 'divider';

export type VariableTypeOption =
  | {
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
      path?: Array<number | string>;
    }
  | typeof VARIABLE_TYPE_DIVIDER;

const getFileChildren = (
  parentPath: Array<number | string>,
): VariableTypeOption[] => {
  const FLAGS = getFlags();

  const result: Array<VariableTypeOption | null> = [
    generateVariableOption({
      type: ViewVariableType.File,
      label: 'Default',
      display: 'File',
      parentPath,
    }),
    VARIABLE_TYPE_DIVIDER,
    generateVariableOption({ type: ViewVariableType.Image, parentPath }),
    generateVariableOption({ type: ViewVariableType.Svg, parentPath }),
    VARIABLE_TYPE_DIVIDER,
    generateVariableOption({ type: ViewVariableType.Audio, parentPath }),
    generateVariableOption({ type: ViewVariableType.Video, parentPath }),
    // 1. 是否开启了auto start节点支持音色字段能力
    // 2. 是否开启了语音资源功能
    FLAGS['bot.automation.start_support_voice'] &&
    FLAGS['bot.studio.library_voice_resource']
      ? generateVariableOption({ type: ViewVariableType.Voice })
      : null,
    VARIABLE_TYPE_DIVIDER,
    generateVariableOption({ type: ViewVariableType.Doc, parentPath }),
    generateVariableOption({ type: ViewVariableType.Ppt, parentPath }),
    generateVariableOption({ type: ViewVariableType.Excel, parentPath }),
    generateVariableOption({ type: ViewVariableType.Txt, parentPath }),
    generateVariableOption({ type: ViewVariableType.Code, parentPath }),
    VARIABLE_TYPE_DIVIDER,
    generateVariableOption({ type: ViewVariableType.Zip, parentPath }),
  ];

  return result.filter((v): v is VariableTypeOption => Boolean(v));
};

const getArrayChildren = (
  parentPath: Array<number | string>,
): Array<VariableTypeOption> => {
  const fileArrayValue = '$file-array-category';
  const fileArrayParentPath = parentPath.concat(fileArrayValue);
  return [
    generateVariableOption({ type: ViewVariableType.ArrayString, parentPath }),
    generateVariableOption({ type: ViewVariableType.ArrayInteger, parentPath }),
    generateVariableOption({ type: ViewVariableType.ArrayNumber, parentPath }),
    generateVariableOption({ type: ViewVariableType.ArrayBoolean, parentPath }),
    generateVariableOption({ type: ViewVariableType.ArrayTime, parentPath }),
    generateVariableOption({ type: ViewVariableType.ArrayObject, parentPath }),
    {
      value: fileArrayValue,
      label: 'File',
      children: [
        generateVariableOption({
          type: ViewVariableType.ArrayFile,
          label: 'Default',
          display: 'Array<File>',
          parentPath: fileArrayParentPath,
        }),
        VARIABLE_TYPE_DIVIDER,
        generateVariableOption({
          type: ViewVariableType.ArrayImage,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArraySvg,
          parentPath: fileArrayParentPath,
        }),
        VARIABLE_TYPE_DIVIDER,
        generateVariableOption({
          type: ViewVariableType.ArrayAudio,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArrayVideo,
          parentPath: fileArrayParentPath,
        }),
        VARIABLE_TYPE_DIVIDER,
        generateVariableOption({
          type: ViewVariableType.ArrayDoc,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArrayPpt,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArrayExcel,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArrayTxt,
          parentPath: fileArrayParentPath,
        }),
        generateVariableOption({
          type: ViewVariableType.ArrayCode,
          parentPath: fileArrayParentPath,
        }),
        VARIABLE_TYPE_DIVIDER,
        generateVariableOption({
          type: ViewVariableType.ArrayZip,
          parentPath: fileArrayParentPath,
        }),
      ],
    },
  ];
};

export const allVariableTypeList: Array<VariableTypeOption> = [
  generateVariableOption({ type: ViewVariableType.String }),
  generateVariableOption({ type: ViewVariableType.Integer }),
  generateVariableOption({ type: ViewVariableType.Number }),
  generateVariableOption({ type: ViewVariableType.Boolean }),
  generateVariableOption({ type: ViewVariableType.Time }),
  generateVariableOption({ type: ViewVariableType.Object }),
  {
    value: '$array-category',
    label: 'Array',
    children: getArrayChildren(['$array-category']),
  },
  {
    value: '$file-category',
    label: 'File',
    children: getFileChildren(['$file-category']),
  },
];

const filterTypes = (
  list: Array<VariableTypeOption>,
  options?: VariableListOptions,
): VariableTypeOption[] => {
  const { disabledTypes = [], hiddenTypes = [], level } = options || {};

  const result: VariableTypeOption[] = list.reduce((pre, cur) => {
    if (cur === VARIABLE_TYPE_DIVIDER) {
      return [...pre, VARIABLE_TYPE_DIVIDER];
    }
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
  // 如果分隔符在开始和末尾，则去掉
  while (result[0] === VARIABLE_TYPE_DIVIDER) {
    result.shift();
  }
  while (result[result.length - 1] === VARIABLE_TYPE_DIVIDER) {
    result.pop();
  }
  return result;
};

interface VariableListOptions {
  disabledTypes?: Array<ViewVariableType>;
  hiddenTypes?: Array<ViewVariableType>;
  level?: number;
}

export const getVariableTypeList = options =>
  filterTypes(allVariableTypeList, options);

/**
 * 获取类型在选项列表中的路径
 */
export const getSelectedValuePath = (
  originalVal: ViewVariableType,
  list: Array<VariableTypeOption>,
  path: Array<string | number> = [],
) => {
  let valuePath = [...path];
  list.forEach(item => {
    if (item === VARIABLE_TYPE_DIVIDER) {
      return;
    }
    if (item.children) {
      const childPath = getSelectedValuePath(originalVal, item.children, [
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
