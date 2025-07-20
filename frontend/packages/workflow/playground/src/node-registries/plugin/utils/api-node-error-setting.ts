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
 * 如果打开了异常开关，需要保证 errorBody 存在在 outputs 中
 */
export function withErrorBody(
  originValue: ApiNodeDTODataWhenOnInit,
  value: ApiNodeDTODataWhenOnInit,
) {
  const draft = cloneDeep(value);

  const isBatchMode = Boolean(draft.inputs?.batch?.batchEnable);
  const isSettingOnError = Boolean(draft.inputs?.settingOnError?.switch);

  // batch 模式下，变量最外层会包裹一个 outputList 的变量
  // 因此，如果是 batch 模式，这里比较需要比较 outputList 的 children
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
  // 找到原来的 errorBody 附加上去
  const originErrorBody = originValue?.outputs?.find(
    v => v.name === errorSetting.name,
  );
  const hasErrorBody = !!originOutputs.find(v => v.name === errorSetting.name);

  // 如果存在脏数据，打开了异常开关，但是 errorBody 不存在，需要加上 errorBody 数据
  // 如果原来的 outputs 中有 errorBody，使用原来的变量数据，否则重新生成一个
  if (!hasErrorBody) {
    originOutputs.push(originErrorBody ?? errorSetting.generate());
  }
}
