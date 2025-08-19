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

import { configs as GLOBAL_ENVS } from '@coze-studio/bot-env-adapter/configs';

import { openSdkDefineEnvs } from './env';
import { IS_OVERSEA } from './base';

export const getRspackAppDefineEnvs = () => ({
  ...openSdkDefineEnvs,
  /**
   * ChatArea 依赖
   */
  IS_OVERSEA,
  CARD_BUILDER_ENV_STR: JSON.stringify(GLOBAL_ENVS.CARD_BUILDER_ENV_STR),
  SAMI_WS_ORIGIN: JSON.stringify(GLOBAL_ENVS.SAMI_WS_ORIGIN),
  SAMI_APP_KEY: JSON.stringify(GLOBAL_ENVS.SAMI_APP_KEY),
  SAMI_CHAT_WS_URL: JSON.stringify(GLOBAL_ENVS.SAMI_CHAT_WS_URL),
  COZE_API_TTS_BASE_URL: JSON.stringify(GLOBAL_ENVS.COZE_API_TTS_BASE_URL),
  FEATURE_ENABLE_MSG_DEBUG: false,
  APP_ID: '""',
  COZE_DOMAIN: JSON.stringify(GLOBAL_ENVS.COZE_DOMAIN),
});
