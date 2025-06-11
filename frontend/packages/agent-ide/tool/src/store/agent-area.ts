import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

export interface IAgentAreaState {
  /**
   * @deprecated 过渡期使用，用户手动搞的key list
   */
  manualAgentSkillKeyList: AgentSkillKey[];
  hasAgentSkillKeyList: AgentSkillKey[];
  initialedAgentSkillKeyList: AgentSkillKey[];
  registeredAgentSkillKeyList: AgentSkillKey[];
}

export interface IAgentAreaAction {
  /**
   * @deprecated 过渡期使用，后续删除
   */
  appendManualAgentSkillKeyList: (skillKey: AgentSkillKey) => void;
  setHasAgentSkillKey: (skillKey: AgentSkillKey, hasSkill: boolean) => void;
  existHasAgentSkillKey: (skillKey: AgentSkillKey) => boolean;
  appendRegisteredAgentSkillKeyList: (skillKey: AgentSkillKey) => void;
  hasAgentSkillKeyInRegisteredAgentSkillKeyList: (
    skillKey: AgentSkillKey,
  ) => boolean;
  existManualAgentSkillKey: (skillKey: AgentSkillKey) => boolean;
  appendIntoInitialedAgentSkillKeyList: (skillKey: AgentSkillKey) => void;
  clearStore: () => void;
}

export const createAgentAreaStore = () =>
  create<IAgentAreaState & IAgentAreaAction>()(
    devtools(
      (set, get) => ({
        manualAgentSkillKeyList: [],
        hasAgentSkillKeyList: [],
        registeredAgentSkillKeyList: [],
        initialedAgentSkillKeyList: [],
        setHasAgentSkillKey: (skillKey, hasSkill) => {
          set(
            produce<IAgentAreaState>(state => {
              const { hasAgentSkillKeyList } = state;

              if (hasSkill) {
                if (!hasAgentSkillKeyList.includes(skillKey)) {
                  hasAgentSkillKeyList.push(skillKey);
                }
              } else {
                const index = hasAgentSkillKeyList.findIndex(
                  key => key === skillKey,
                );
                if (index >= 0) {
                  hasAgentSkillKeyList.splice(index, 1);
                }
              }
            }),
          );
        },
        existHasAgentSkillKey: skillKey => {
          const { hasAgentSkillKeyList } = get();
          return hasAgentSkillKeyList.includes(skillKey);
        },
        appendRegisteredAgentSkillKeyList: (skillKey: AgentSkillKey) => {
          const { registeredAgentSkillKeyList } = get();
          if (!registeredAgentSkillKeyList.includes(skillKey)) {
            set({
              registeredAgentSkillKeyList: [
                ...registeredAgentSkillKeyList,
                skillKey,
              ],
            });
          }
        },
        hasAgentSkillKeyInRegisteredAgentSkillKeyList: (
          skillKey: AgentSkillKey,
        ) => {
          const { registeredAgentSkillKeyList } = get();
          return registeredAgentSkillKeyList.includes(skillKey);
        },
        appendManualAgentSkillKeyList: skillKey => {
          const { manualAgentSkillKeyList } = get();
          if (!manualAgentSkillKeyList.includes(skillKey)) {
            set({
              manualAgentSkillKeyList: [...manualAgentSkillKeyList, skillKey],
            });
          }
        },
        existManualAgentSkillKey: skillKey =>
          get().manualAgentSkillKeyList.includes(skillKey),
        appendIntoInitialedAgentSkillKeyList: skillKey => {
          const { initialedAgentSkillKeyList } = get();
          if (!initialedAgentSkillKeyList.includes(skillKey)) {
            set({
              initialedAgentSkillKeyList: [
                ...initialedAgentSkillKeyList,
                skillKey,
              ],
            });
          }
        },
        clearStore: () => {
          set({
            hasAgentSkillKeyList: [],
          });
        },
      }),
      {
        name: 'botStudio.tool.AgentAreaStore',
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type AgentAreaStore = ReturnType<typeof createAgentAreaStore>;
