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

import { type VoiceConfig } from '@coze-arch/bot-api/workflow_api';

export interface VoiceValue {
  language?: string;
  data?: VoiceConfig;
}

export const formatVoicesObj2Arr = (
  value: Record<string, VoiceConfig>,
): VoiceValue[] => {
  const temp = Object.keys(value).map(lang => ({
    language: lang,
    data: value[lang],
  }));
  return temp.length ? temp : [{}];
};
