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
