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

import { type BotPrompt, PromptType } from '@coze-arch/bot-api/developer_api';

import { usePersonaStore } from '../store/persona';

export interface SaveBotPrompt extends BotPrompt {
  id: string;
}

export const getReplacedBotPrompt = () => {
  const { systemMessage } = usePersonaStore.getState();

  return [
    {
      prompt_type: PromptType.SYSTEM,
      data: systemMessage.data,
    },
    {
      prompt_type: PromptType.USERPREFIX,
      data: '',
    },
    {
      prompt_type: PromptType.USERSUFFIX,
      data: '',
    },
  ];
};
