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

import { useUpdateEffect } from 'ahooks';
import { SettingOnErrorProcessType } from '@coze-workflow/nodes';

import { type SettingOnErrorProps } from '../types';

interface Props
  extends Pick<SettingOnErrorProps, 'isBatch' | 'value' | 'onChange'> {
  isSettingOnErrorV2?: boolean;
}

/**
 * The batch scenario does not support abnormal branches. If abnormal branches are set when the batch is changed, it will be automatically converted to return the set content.
 */
export const useBatchChange = (props: Props) => {
  const { isBatch, value, onChange, isSettingOnErrorV2 } = props;
  useUpdateEffect(() => {
    if (
      isSettingOnErrorV2 &&
      isBatch &&
      value?.processType === SettingOnErrorProcessType.EXCEPTION
    ) {
      onChange?.({
        ...value,
        processType: SettingOnErrorProcessType.RETURN,
      });
    }
  }, [isBatch, isSettingOnErrorV2, onChange, value]);
};
