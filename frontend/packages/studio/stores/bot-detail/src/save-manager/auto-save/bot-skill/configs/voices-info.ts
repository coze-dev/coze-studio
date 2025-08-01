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

import { merge } from 'lodash-es';
import { type BotInfoForUpdate } from '@coze-arch/idl/playground_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type TTSInfo, type VoicesInfo } from '@/types/skill';
import { transformVo2Dto } from '@/store/bot-skill/transform';
import { type BotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

interface Values {
  voicesInfo: VoicesInfo;
  tts: TTSInfo;
}

type RegisterVariables = HostedObserverConfig<BotSkillStore, ItemType, Values>;

export const voicesInfoConfig: RegisterVariables = {
  key: ItemType.PROFILEMEMORY,
  selector: store => ({ voicesInfo: store.voicesInfo, tts: store.tts }),
  debounce: DebounceTime.Immediate,
  middleware: {
    // Be careful when changing any warnings
    onBeforeSave: (
      values: Values,
    ): Pick<Required<BotInfoForUpdate>, 'voices_info'> => ({
      voices_info: merge(
        {},
        transformVo2Dto.tts(values.tts),
        transformVo2Dto.voicesInfo(values.voicesInfo),
      ),
    }),
  },
};
