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

import { cloneDeep, merge } from 'lodash-es';

import { useBotSkillStore } from '@/store/bot-skill';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';
import { ItemTypeExtra } from '../types';

export const saveTTSConfig = async () => {
  const { tts, transformVo2Dto, voicesInfo } = useBotSkillStore.getState();
  const {
    muted = false,
    close_voice_call = false,
    i18n_lang_voice = {},
    autoplay = false,
    autoplay_voice = {},
    i18n_lang_voice_str,
  } = tts;

  const cloneVoiceInfo = {
    muted,
    close_voice_call,
    i18n_lang_voice: cloneDeep(i18n_lang_voice),
    autoplay,
    autoplay_voice: cloneDeep(autoplay_voice),
    i18n_lang_voice_str: cloneDeep(i18n_lang_voice_str),
  };

  return await saveFetcher(
    () =>
      updateBotRequest({
        voices_info: merge(
          {},
          transformVo2Dto.tts(cloneVoiceInfo),
          transformVo2Dto.voicesInfo(voicesInfo),
        ),
      }),

    ItemTypeExtra.TTS,
  );
};
