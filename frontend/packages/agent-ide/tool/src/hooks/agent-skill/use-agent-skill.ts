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

import { useAbilityAreaContext } from '../../context/ability-area-context';

/**
 * @Deprecated internal use, transition scenario, using external skill settings for non-registered components
 */
export const useHasAgentSkillWithPK = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();

  const { existManualAgentSkillKey, realSetHasAgentSkill } = useAgentAreaStore(
    state => ({
      existManualAgentSkillKey: state.existManualAgentSkillKey,
      realSetHasAgentSkill: state.setHasAgentSkillKey,
    }),
  );

  /**
   * @deprecated internal use, transition period
   */
  const setHasAgentSkill = (
    agentSkillKey: AgentSkillKey,
    hasSkill: boolean,
  ) => {
    const isManual = existManualAgentSkillKey(agentSkillKey);

    if (!isManual) {
      realSetHasAgentSkill(agentSkillKey, hasSkill);
    }
  };

  return {
    setHasAgentSkill,
  };
};

export const useNoneAgentSkill = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();

  const noneAgentSkill = useAgentAreaStore(
    useShallow(state =>
      state.registeredAgentSkillKeyList.every(
        agentSkillKey => !state.hasAgentSkillKeyList.includes(agentSkillKey),
      ),
    ),
  );

  return noneAgentSkill;
};
