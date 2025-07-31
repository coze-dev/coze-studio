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
import {
  AbilityScope,
  type ToolKey,
  type AgentSkillKey,
  type AbilityKey,
} from '@coze-agent-ide/tool-config';

import { useEvent } from '../../event/use-event';
import { useAbilityConfig } from '../../builtin/use-ability-config';
import { generateError } from '../../../utils/error';
import { EventCenterEventName } from '../../../typings/scoped-events';
import { type IAbilityInitialedEventParams } from '../../../typings/event';
import { useAbilityAreaContext } from '../../../context/ability-area-context';

export const useInit = () => {
  const { on, emit } = useEvent();
  const { abilityKey, scope } = useAbilityConfig();

  if (!abilityKey || !scope) {
    throw generateError('AbilityKey or Scope is undefined');
  }

  const {
    store: { useToolAreaStore, useAgentAreaStore },
  } = useAbilityAreaContext();

  const { registeredToolKeyConfigList, appendIntoInitialedToolKeyList } =
    useToolAreaStore(
      useShallow(state => ({
        registeredToolKeyConfigList: state.registeredToolKeyConfigList,
        appendIntoInitialedToolKeyList: state.appendIntoInitialedToolKeyList,
      })),
    );

  const { registeredAgentSkillKeyList, appendIntoInitialedAgentSkillKeyList } =
    useAgentAreaStore(
      useShallow(state => ({
        registeredAgentSkillKeyList: state.registeredAgentSkillKeyList,
        appendIntoInitialedAgentSkillKeyList:
          state.appendIntoInitialedAgentSkillKeyList,
      })),
    );

  function markToolInitialed() {
    let updatedInitialedAbilityKeyList: ToolKey[] | AgentSkillKey[] = [];

    if (scope === AbilityScope.TOOL) {
      appendIntoInitialedToolKeyList(abilityKey as unknown as ToolKey);
      updatedInitialedAbilityKeyList =
        useToolAreaStore.getState().initialedToolKeyList;
    } else if (scope === AbilityScope.AGENT_SKILL) {
      appendIntoInitialedAgentSkillKeyList(
        abilityKey as unknown as AgentSkillKey,
      );
      updatedInitialedAbilityKeyList =
        useAgentAreaStore.getState().initialedAgentSkillKeyList;
    }

    emit<IAbilityInitialedEventParams>(EventCenterEventName.AbilityInitialed, {
      initialedAbilityKeyList: updatedInitialedAbilityKeyList,
    });
  }

  function onToolInitialed(
    listener: () => void,
    listenedAbilityKey: AbilityKey,
  ) {
    const offToolInitialed = on<IAbilityInitialedEventParams>(
      EventCenterEventName.AbilityInitialed,
      params => {
        const { initialedAbilityKeyList } = params;
        if (initialedAbilityKeyList.includes(listenedAbilityKey)) {
          listener();
          offToolInitialed();
        }
      },
    );
  }

  function onAllToolInitialed(listener: (isAllInitialed: boolean) => void) {
    const offToolInitialed = on<IAbilityInitialedEventParams>(
      EventCenterEventName.AbilityInitialed,
      params => {
        const { initialedAbilityKeyList } = params;

        let isAllRegisteredAbilityKeyInitialed = false;

        if (scope === AbilityScope.TOOL) {
          isAllRegisteredAbilityKeyInitialed =
            registeredToolKeyConfigList.every(toolKeyConfig =>
              initialedAbilityKeyList.includes(toolKeyConfig.toolKey),
            );
        } else if (scope === AbilityScope.AGENT_SKILL) {
          isAllRegisteredAbilityKeyInitialed =
            registeredAgentSkillKeyList.every(agentSkillKey =>
              initialedAbilityKeyList.includes(agentSkillKey),
            );
        }

        listener(isAllRegisteredAbilityKeyInitialed);
      },
    );

    return offToolInitialed;
  }

  return {
    markToolInitialed,
    onToolInitialed,
    onAllToolInitialed,
  };
};
