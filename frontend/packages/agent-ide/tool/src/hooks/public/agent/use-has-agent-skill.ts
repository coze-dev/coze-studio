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

import { useShallow } from 'zustand/react/shallow';
import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

import { useAbilityAreaContext } from '../../../context/ability-area-context';

export const useHasAgentSkill = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();
  const {
    setHasAgentSkillKey,
    existHasAgentSkillKey,
    appendManualAgentSkillKeyList,
  } = useAgentAreaStore(
    useShallow(state => ({
      setHasAgentSkillKey: state.setHasAgentSkillKey,
      existHasAgentSkillKey: state.existHasAgentSkillKey,
      appendManualAgentSkillKeyList: state.appendManualAgentSkillKeyList,
    })),
  );

  const setHasAgentSkill = (
    agentSkillKey: AgentSkillKey,
    hasSkill: boolean,
  ) => {
    setHasAgentSkillKey(agentSkillKey, hasSkill);
    appendManualAgentSkillKeyList(agentSkillKey);
  };

  const getHasAgentSkill = (agentSkillKey: AgentSkillKey) =>
    existHasAgentSkillKey(agentSkillKey);

  return {
    setHasAgentSkill,
    getHasAgentSkill,
  };
};
