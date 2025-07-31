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

import { I18n } from '@coze-arch/i18n';
import { BotTableRWMode } from '@coze-arch/bot-api/memory';
import {
  type BackgroundImageInfo,
  SuggestedQuestionsShowMode,
  SuggestReplyMode,
} from '@coze-arch/bot-api/developer_api';

import {
  type VoicesInfo,
  type BotSuggestionConfig,
  type DatabaseInfo,
  type ExtendOnboardingContent,
  type TimeCapsuleConfig,
  type TTSInfo,
} from '../../types/skill';

export const DEFAULT_KNOWLEDGE_CONFIG = () => {
  const baseConfig = {
    top_k: 3,
    min_score: 0.5,
    auto: true,
    search_strategy: 0,
    show_source: false,
  };
  return baseConfig;
};

export const DEFAULT_BOT_NODE_SUGGESTION_CONFIG = (): BotSuggestionConfig => ({
  suggest_reply_mode: SuggestReplyMode.UseOriginBotMode,
  customized_suggest_prompt: '',
});

export const DEFAULT_SUGGESTION_PROMPT = () =>
  IS_OVERSEA
    ? I18n.t('bot_suggestion_customize_default_gpt')
    : I18n.t('bot_suggestion_customize_default_seed');

export const DEFAULT_ONBOARDING_CONFIG = (): ExtendOnboardingContent => ({
  prologue: '',
  suggested_questions: [],
  suggested_questions_show_mode: SuggestedQuestionsShowMode.Random,
});

export const DEFAULT_SUGGESTION_CONFIG = (): BotSuggestionConfig => ({
  suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
  customized_suggest_prompt: '',
});

export const DEFAULT_BACKGROUND_IMAGE_LIST = (): BackgroundImageInfo[] => [];
export const DEFAULT_DATABASE = (): DatabaseInfo => ({
  tableId: '',
  name: '',
  desc: '',
  icon_uri: '',
  readAndWriteMode: BotTableRWMode.LimitedReadWrite,
  tableMemoryList: [],
});
export const DEFAULT_TTS_CONFIG = (): TTSInfo => ({
  muted: false,
  close_voice_call: false,
  i18n_lang_voice: {},
  autoplay: false,
  autoplay_voice: {},
  tag_list: [],
  debugVoice: [],
  i18n_lang_voice_str: {},
});

export const DEFAULT_TIME_CAPSULE_CONFIG = (): TimeCapsuleConfig => ({
  time_capsule_mode: 0,
  disable_prompt_calling: 0, // Default support for prompt calls
  time_capsule_time_to_live: '0',
});

export const DEFAULT_SHORTCUT_CONFIG = () => ({
  shortcut_list: [],
  shortcut_sort: [],
});

export const DEFAULT_VOICES_INFO: () => VoicesInfo = () => ({
  defaultUserInputType: undefined,
});
