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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { size } from 'lodash-es';
import {
  AbilityScope,
  TOOL_KEY_STORE_MAP,
  AGENT_SKILL_KEY_MAP,
} from '@coze-agent-ide/tool-config';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import {
  type BotSkillAction,
  type BotSkillStore,
  useBotSkillStore,
} from '@coze-studio/bot-detail-store/bot-skill';
import { findTargetAgent } from '@coze-studio/bot-detail-store';

import { useAbilityStoreContext } from '../../store/use-ability-store-context';
import { useAbilityConfig } from '../../builtin/use-ability-config';
import { generateError } from '../../../utils/error';

const KEY_MAP = {
  [AbilityScope.TOOL]: TOOL_KEY_STORE_MAP,
  [AbilityScope.AGENT_SKILL]: AGENT_SKILL_KEY_MAP,
};

// Access state in the global fine-state machine
export function useToolStore<U>(selector: (state: BotSkillStore) => U): U {
  const { abilityKey } = useAbilityConfig();

  if (!abilityKey) {
    throw generateError('not find abilityKey');
  }

  return useBotSkillStore(selector) as U;
}

// Access methods in the global fine-state machine
export function useToolStoreAction<U>(
  selector: (state: BotSkillAction) => U,
): U {
  const { abilityKey } = useAbilityConfig();

  if (!abilityKey) {
    throw generateError('not find abilityKey');
  }

  return useBotSkillStore(selector) as U;
}

// submit data
export function useToolDispatch<T>() {
  const { abilityKey, scope } = useAbilityConfig();

  const { state, setState } = useAbilityStoreContext();

  if (!abilityKey || !scope) {
    throw generateError('not find abilityKey or scope');
  }

  return (newState: T) => {
    setState({
      [scope]: {
        ...state[scope],
        // @ts-expect-error -- I want to solve the type problem here in the future
        [KEY_MAP[scope][abilityKey]]: newState,
      },
    });
  };
}

// Monitor tool fine-state machine data changes and sync to bot detail store
export function useSubscribeToolStore(scope: AbilityScope, agentId?: string) {
  // Bot detail store update method
  const { setBotSkill } = useBotSkillStore(
    useShallow(state => ({
      setBotSkill: state.setBotSkill,
    })),
  );
  const { setMultiAgentByImmer } = useMultiAgentStore(
    useShallow(state => ({
      setMultiAgentByImmer: state.setMultiAgentByImmer,
    })),
  );

  // Tools store data
  const { state } = useAbilityStoreContext();
  const newState = state[scope];

  // synchronize data
  useEffect(() => {
    if (size(newState)) {
      if (!newState) {
        return;
      }

      if (scope === AbilityScope.TOOL) {
        setBotSkill(newState);
      } else if (scope === AbilityScope.AGENT_SKILL) {
        setMultiAgentByImmer(agentState => {
          const agent = findTargetAgent(agentState.agents, agentId);
          if (agent) {
            agent.skills = newState;
          }
        });
      }
    }
  }, [newState]);
}
