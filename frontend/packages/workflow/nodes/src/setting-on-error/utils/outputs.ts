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
 * Add/remove errorBody to output
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
  // Add errorBody
  if (isOpen) {
    // In batch mode, append errorBody to children in the first layer
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
      // In single mode, append an errorBody to the first layer
    } else {
      return [
        ...(value ?? []).filter(excludeFn(isSettingOnErrorV2)),
        generateErrorBodyMeta(),
        ...(isSettingOnErrorV2 ? [generateIsSuccessMeta()] : []),
      ];
    }
    // errorBody
  } else {
    // In batch mode, remove children from the first layer
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
      // In single mode, remove children from the first layer
    } else {
      return [...(value ?? []).filter(excludeFn(isSettingOnErrorV2))];
    }
  }
};

/**
 * The output property is sorted to ensure that errorBody is at the bottom
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
 * Remove the errorBody from the value
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
