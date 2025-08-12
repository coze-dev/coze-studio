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

import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { BotSuggestionConfig } from '@/types/skill';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterSuggestionConfig = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  BotSuggestionConfig
>;

export const suggestionConfig: RegisterSuggestionConfig = {
  key: ItemType.SUGGESTREPLY,
  selector: store => store.suggestionConfig,
  debounce: {
    default: DebounceTime.Immediate,
    customized_suggest_prompt: DebounceTime.Long,
  },
  middleware: {
    onBeforeSave: dataSource => ({
      suggest_reply_info: useBotSkillStore
        .getState()
        .transformVo2Dto.suggestionConfig(dataSource),
    }),
  },
};
