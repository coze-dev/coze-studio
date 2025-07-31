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

import {
  usePersonaStore,
  type PersonaStore,
  type RequiredBotPrompt,
} from '@/store/persona';
import { ItemType } from '@/save-manager/types';

type RegisterSystemContent = HostedObserverConfig<
  PersonaStore,
  ItemType,
  RequiredBotPrompt
>;

export const personaConfig: RegisterSystemContent = {
  key: ItemType.SYSTEMINFO,
  selector: state => state.systemMessage,
  debounce: () => {
    const { systemMessage } = usePersonaStore.getState();
    const { isOptimize } = systemMessage;

    console.log('systemMessage:>>', systemMessage);
    console.log('isOptimize:>>', isOptimize);
    if (isOptimize) {
      return DebounceTime.Immediate;
    }
    return DebounceTime.Long;
  },
  middleware: {
    onBeforeSave: nextState => ({
      prompt_info: usePersonaStore.getState().transformVo2Dto(nextState),
    }),
  },
};
