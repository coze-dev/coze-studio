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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface WorkflowState {
  showModalDefault: boolean;
}
interface BotState {
  previousBotID: string;
  modeSwitching: boolean;
}

interface BotPageState {
  bot: BotState;
  tools: {
    workflow: WorkflowState;
  };
}

interface BotPageAction {
  setBotState: (state: Partial<BotState>) => void;
  setWorkflowState: (state: Partial<WorkflowState>) => void;
}

const initialStoreState: BotPageState = {
  bot: { previousBotID: '', modeSwitching: false },
  tools: {
    workflow: {
      showModalDefault: false,
    },
  },
};

const useBotPageStore = create<BotPageState & BotPageAction>()(
  devtools(
    (set, get) => ({
      ...initialStoreState,
      setBotState: nextState => {
        const prevState = get().bot;

        set({
          bot: { ...prevState, ...nextState },
        });
      },
      setWorkflowState: nextState => {
        const prevState = get().tools.workflow;

        set({
          tools: { workflow: { ...prevState, ...nextState } },
        });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botPage',
    },
  ),
);

export { useBotPageStore };
