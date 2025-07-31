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

import { type FC } from 'react';

import { type SettingOnErrorProps } from './types';
import { useSettingOnError } from './hooks/use-setting-on-error';
import { ErrorForm } from './error-form';
import { ErrorForm as ErrorFormV2 } from './components';

export const SettingOnError: FC<SettingOnErrorProps> = ({
  value,
  onChange,
  batchModePath,
  outputsPath,
  readonly,
  context,
  options,
  noPadding,
}) => {
  const { isSettingOnErrorV2, ...settingOnError } = useSettingOnError({
    value,
    onChange,
    batchModePath,
    outputsPath,
    context,
    options,
  });
  if (isSettingOnErrorV2) {
    return (
      <ErrorFormV2
        {...settingOnError}
        readonly={readonly}
        noPadding={noPadding}
      />
    );
  }
  return (
    <ErrorForm {...settingOnError} readonly={readonly} noPadding={noPadding} />
  );
};
