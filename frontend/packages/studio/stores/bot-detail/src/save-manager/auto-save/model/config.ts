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

import { type ModelInfo } from '@coze-arch/bot-api/developer_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type ModelStore, useModelStore } from '@/store/model';
import { ItemType } from '@/save-manager/types';

type RegisterSystemContent = HostedObserverConfig<
  ModelStore,
  ItemType,
  ModelInfo
>;

export const modelConfig: RegisterSystemContent = {
  key: ItemType.OTHERINFO,
  selector: store => store.config,
  debounce: {
    default: DebounceTime.Immediate,
    temperature: DebounceTime.Medium,
    max_tokens: DebounceTime.Medium,
    'ShortMemPolicy.HistoryRound': DebounceTime.Medium,
  },
  middleware: {
    onBeforeSave: dataSource => ({
      model_info: useModelStore.getState().transformVo2Dto(dataSource),
    }),
  },
};
