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

import get from 'lodash-es/get';
import { TimeCapsuleMode } from '@coze-arch/idl/playground_api';

import { useBotInfo } from './use-bot-info';

export const useLTMInfo = (botId?: string) => {
  const { isLoading, botInfo } = useBotInfo(botId);
  const timeCapsuleMode = get(
    botInfo,
    ['bot_info', 'bot_tag_info', 'time_capsule_info', 'time_capsule_mode'],
    TimeCapsuleMode.Off,
  );

  return {
    // Is long-term memory switched on?
    ltmEnabled: timeCapsuleMode === TimeCapsuleMode.On,
    isLoading,
  };
};
