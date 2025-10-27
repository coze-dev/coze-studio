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

import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemTypeExtra } from '@/save-manager/types';

type RegisterMemoryToolConfig = HostedObserverConfig<
  BotSkillStore,
  ItemTypeExtra,
  { mode?: number }
>;

export const memoryToolConfig: RegisterMemoryToolConfig = {
  key: ItemTypeExtra.MEMORY_TOOL_CONFIG,
  selector: store => store.memoryToolConfig,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: dataSource => ({
      memory_tool_config: useBotSkillStore
        .getState()
        .transformVo2Dto.memoryToolConfig(dataSource),
    }),
  },
};
