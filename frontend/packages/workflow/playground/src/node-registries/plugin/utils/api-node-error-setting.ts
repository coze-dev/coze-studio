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

import { cloneDeep } from 'lodash-es';
import {
  ERROR_BODY_NAME,
  generateErrorBodyMeta,
  generateIsSuccessMeta,
  IS_SUCCESS_NAME,
  type ViewVariableTreeNode,
} from '@coze-workflow/nodes';

import { type ApiNodeDTODataWhenOnInit } from '../types';

interface ErrorSetting {
  name: string;
  generate: () => ViewVariableTreeNode;
}

const errorSettings: ErrorSetting[] = [
  {
    name: ERROR_BODY_NAME,
    generate: generateErrorBodyMeta,
  },
  {
    name: IS_SUCCESS_NAME,
    generate: generateIsSuccessMeta,
  },
];

/**
 * If the exception switch is turned on, you need to ensure that the errorBody exists in the outputs
 */
export function withErrorBody(
  originValue: ApiNodeDTODataWhenOnInit,
  value: ApiNodeDTODataWhenOnInit,
) {
  const draft = cloneDeep(value);

  const isBatchMode = Boolean(draft.inputs?.batch?.batchEnable);
  const isSettingOnError = Boolean(draft.inputs?.settingOnError?.switch);

  // In batch mode, the outermost layer of the variable will wrap an outputList variable
  // Therefore, if it is batch mode, it is necessary to compare the children of the outputList here.
  const originOutputs =
    (isBatchMode ? draft.outputs?.[0]?.children : draft.outputs) || [];

  if (isSettingOnError) {
    errorSettings.forEach(errorSetting =>
      addErrorSetting(originValue, originOutputs, errorSetting),
    );
  }

  return draft;
}

function addErrorSetting(
  originValue: ApiNodeDTODataWhenOnInit,
  originOutputs: ApiNodeDTODataWhenOnInit['outputs'],
  errorSetting: ErrorSetting,
) {
  // Find the original errorBody and attach it.
  const originErrorBody = originValue?.outputs?.find(
    v => v.name === errorSetting.name,
  );
  const hasErrorBody = !!originOutputs.find(v => v.name === errorSetting.name);

  // If there is dirty data, the exception switch is turned on, but errorBody does not exist, you need to add errorBody data
  // If there is an errorBody in the original outputs, use the original variable data, otherwise regenerate a new one
  if (!hasErrorBody) {
    originOutputs.push(originErrorBody ?? errorSetting.generate());
  }
}
