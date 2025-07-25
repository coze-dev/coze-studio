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
 
import { type ViewVariableTreeNode } from '@coze-workflow/base';

import { ERROR_BODY_NAME, IS_SUCCESS_NAME } from '../constants';
import { generateErrorBodyMeta, generateIsSuccessMeta } from './generate-meta';

const settingOnErrorNames = isSettingOnErrorV2 => [
  ERROR_BODY_NAME,
  ...(isSettingOnErrorV2 ? [IS_SUCCESS_NAME] : []),
];

const excludeFn = isSettingOnErrorV2 => v =>
  !settingOnErrorNames(isSettingOnErrorV2).includes(v.name);

const includeFn = isSettingOnErrorV2 => v =>
  settingOnErrorNames(isSettingOnErrorV2).includes(v.name);

/**
 * 向 output 中添加/剔除 errorBody
 */
export const getOutputsWithErrorBody = ({
  value,
  isBatch,
  isOpen,
  isSettingOnErrorV2,
}: {
  value?: ViewVariableTreeNode[];
  isBatch: boolean;
  isOpen: boolean;
  isSettingOnErrorV2?: boolean;
}) => {
  if (!value) {
    return value;
  }
  // 添加 errorBody
  if (isOpen) {
    // batch 模式下，在第一层的 children 里追加 errorBody
    if (isBatch) {
      return [
        {
          ...value[0],
          children: [
            ...(value[0]?.children ?? []).filter(excludeFn(isSettingOnErrorV2)),
            generateErrorBodyMeta(),
            ...(isSettingOnErrorV2 ? [generateIsSuccessMeta()] : []),
          ],
        },
      ];
      // single 模式下，在第一层追加 errorBody
    } else {
      return [
        ...(value ?? []).filter(excludeFn(isSettingOnErrorV2)),
        generateErrorBodyMeta(),
        ...(isSettingOnErrorV2 ? [generateIsSuccessMeta()] : []),
      ];
    }
    // 剔除 errorBody
  } else {
    // batch 模式下，从第一层的 children 中剔除
    if (isBatch) {
      const [one, ...rest] = value;
      return [
        {
          ...one,
          children: [
            ...(one?.children ?? []).filter(excludeFn(isSettingOnErrorV2)),
          ],
        },
        ...rest,
      ];
      // single 模式下，从第一层的 children 中剔除
    } else {
      return [...(value ?? []).filter(excludeFn(isSettingOnErrorV2))];
    }
  }
};

/**
 * output 属性排序，保证 errorBody 在最下面
 */
export const sortErrorBody = ({
  value,
  isBatch,
  isSettingOnErrorV2,
}: {
  value?: ViewVariableTreeNode[];
  isBatch: boolean;
  isSettingOnErrorV2?: boolean;
}) => {
  if (!value) {
    return value;
  }

  if (isBatch) {
    const [one, ...rest] = value;
    return [
      {
        ...one,
        children: [
          ...(one?.children ?? []).filter(excludeFn(isSettingOnErrorV2)),
          ...(one?.children ?? []).filter(includeFn(isSettingOnErrorV2)),
        ],
      },
      ...rest,
    ];
  }
  return [
    ...value.filter(excludeFn(isSettingOnErrorV2)),
    ...value.filter(includeFn(isSettingOnErrorV2)),
  ];
};

/**
 * 把 value 中的 errorBody 删除掉
 */
export const getExcludeErrorBody = ({
  value,
  isBatch,
  isSettingOnErrorV2,
}: {
  value?: ViewVariableTreeNode[];
  isBatch: boolean;
  isSettingOnErrorV2?: boolean;
}) =>
  getOutputsWithErrorBody({
    value,
    isBatch,
    isOpen: false,
    isSettingOnErrorV2,
  });
