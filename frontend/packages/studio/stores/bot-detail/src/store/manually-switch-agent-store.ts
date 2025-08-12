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

/**
 * To fulfill a miraculous function
 * In multi agent mode, replying.
 * The user switched agents manually
 * Regenerate the conversation based on the new agent
 * It is necessary to record that the switch of the agent is "manual" | "automatic"
 */

/**
 * !! Not mixed with Bot Details.
 */

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

export interface ManuallySwitchAgentState {
  agentId: string | null;
}

export interface ManuallySwitchAgentAction {
  recordAgentIdOnManuallySwitchAgent: (agentId: string) => void;
  clearAgentId: () => void;
}

export const useManuallySwitchAgentStore = create<
  ManuallySwitchAgentAction & ManuallySwitchAgentState
>()(
  devtools(
    set => ({
      agentId: null,
      recordAgentIdOnManuallySwitchAgent: agentId => {
        set({ agentId }, false, 'recordAgentIdOnManuallySwitchAgent');
      },
      clearAgentId: () => {
        set({ agentId: null }, false, 'clearAgentId');
      },
    }),
    { enabled: IS_DEV_MODE, name: 'botStudio.manuallySwitchAgentStore' },
  ),
);
