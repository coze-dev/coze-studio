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
import { produce } from 'immer';
import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

export interface IAgentAreaState {
  /**
   * @deprecated transition period use, user manually engaged key list
   */
  manualAgentSkillKeyList: AgentSkillKey[];
  hasAgentSkillKeyList: AgentSkillKey[];
  initialedAgentSkillKeyList: AgentSkillKey[];
  registeredAgentSkillKeyList: AgentSkillKey[];
}

export interface IAgentAreaAction {
  /**
   * @deprecated transitional use, subsequent deletion
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
