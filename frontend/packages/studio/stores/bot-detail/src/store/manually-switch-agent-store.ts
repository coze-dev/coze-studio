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
