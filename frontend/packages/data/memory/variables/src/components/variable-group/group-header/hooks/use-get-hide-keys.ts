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

import { VariableChannel } from '@coze-arch/bot-api/memory';

import { type VariableGroup } from '@/store';

import { flatGroupVariableMeta } from '../../../variable-tree/utils';

export const useGetHideKeys = (variableGroup: VariableGroup) => {
  const hideKeys: string[] = [];

  const hideChannel =
    flatGroupVariableMeta([variableGroup]).filter(
      item => (item?.effectiveChannelList?.length ?? 0) > 0,
    ).length <= 0;

  const hideTypeChange = variableGroup.channel === VariableChannel.Custom;

  if (hideChannel) {
    hideKeys.push('channel');
  }

  if (hideTypeChange) {
    hideKeys.push('type');
  }
  return hideKeys;
};
