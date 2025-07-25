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
 * 用来满足一个神奇的功能
 * multi agent 模式下 正在回复中
 * 用户手动切换了 agent
 * 基于新的 agent 重新生成对话
 * 需要记录 agent 的切换是「手动」|「自动」
 */

/**
 * !! 不和 Bot Detail 搅合在一起了。
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
