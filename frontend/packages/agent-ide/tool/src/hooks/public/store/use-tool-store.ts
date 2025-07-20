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

// 访问全局状态机中的状态
export function useToolStore<U>(selector: (state: BotSkillStore) => U): U {
  const { abilityKey } = useAbilityConfig();

  if (!abilityKey) {
    throw generateError('not find abilityKey');
  }

  return useBotSkillStore(selector) as U;
}

// 访问全局状态机中的方法
export function useToolStoreAction<U>(
  selector: (state: BotSkillAction) => U,
): U {
  const { abilityKey } = useAbilityConfig();

  if (!abilityKey) {
    throw generateError('not find abilityKey');
  }

  return useBotSkillStore(selector) as U;
}

// 提交数据
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
        // @ts-expect-error -- 以后想着解决一下这里的类型问题
        [KEY_MAP[scope][abilityKey]]: newState,
      },
    });
  };
}

// 监听 tool 状态机数据变化，并同步到 bot detail store
export function useSubscribeToolStore(scope: AbilityScope, agentId?: string) {
  // bot detail store 更新方法
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

  // tools store 数据
  const { state } = useAbilityStoreContext();
  const newState = state[scope];

  // 同步数据
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
