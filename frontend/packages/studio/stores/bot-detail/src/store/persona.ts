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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import {
  type BotInfoForUpdate,
  type GetDraftBotInfoAgwData,
} from '@coze-arch/bot-api/playground_api';
import { type BotPrompt, PromptType } from '@coze-arch/bot-api/developer_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';

export const getDefaultPersonaStore = (): PersonaStore => ({
  systemMessage: {
    data: '',
    prompt_type: PromptType.SYSTEM,
    isOptimize: false,
    record_id: '',
  },
  optimizePrompt: '',
  promptOptimizeUuid: '',
  promptOptimizeStatus: 'waitForRespond',
});

export interface RequiredBotPrompt extends BotPrompt {
  prompt_type: PromptType;
  data: string;
  isOptimize: boolean;
  record_id?: string;
}

/** Persona & Prompted Areas */
export interface PersonaStore {
  systemMessage: RequiredBotPrompt;
  optimizePrompt: string;
  promptOptimizeUuid: string;
  promptOptimizeStatus: 'responding' | 'waitForRespond' | 'endResponse';
}

export interface PersonaAction {
  setPersona: SetterAction<PersonaStore>;
  setPersonaByImmer: (update: (state: PersonaStore) => void) => void;
  transformDto2Vo: (data: GetDraftBotInfoAgwData) => RequiredBotPrompt;
  transformVo2Dto: (
    persona: Partial<RequiredBotPrompt>,
  ) => BotInfoForUpdate['prompt_info'];
  initStore: (botData: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const usePersonaStore = create<PersonaStore & PersonaAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultPersonaStore(),
      setPersona: setterActionFactory<PersonaStore>(set),
      setPersonaByImmer: update =>
        set(produce<PersonaStore>(persona => update(persona))),
      transformDto2Vo: botData =>
        ({
          data: botData.bot_info?.prompt_info?.prompt ?? '',
          prompt_type: PromptType.SYSTEM,
          isOptimize: false,
          record_id: '',
        } as unknown as RequiredBotPrompt),
      transformVo2Dto: persona =>
        ({
          prompt: persona?.data || '',
        } as unknown as BotInfoForUpdate['prompt_info']),
      initStore: botData => {
        const { setPersonaByImmer, transformDto2Vo } = get();
        botData &&
          setPersonaByImmer(store => {
            store.systemMessage = transformDto2Vo(botData);
          });
      },
      clear: () => {
        set({ ...getDefaultPersonaStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.persona',
    },
  ),
);
