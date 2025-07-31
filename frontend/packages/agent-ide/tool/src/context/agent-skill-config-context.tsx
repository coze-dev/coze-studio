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

import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

interface IAgentSkillConfigContext {
  agentSkillKey?: AgentSkillKey;
}

const DEFAULT_AGENT_SKILL_CONFIG = {
  agentSkillKey: undefined,
};

const AgentSkillConfigContext = createContext<IAgentSkillConfigContext>(
  DEFAULT_AGENT_SKILL_CONFIG,
);

export const AgentSkillConfigContextProvider: FC<
  PropsWithChildren<IAgentSkillConfigContext>
> = props => {
  const { children, ...rest } = props;

  return (
    <AgentSkillConfigContext.Provider value={rest}>
      {children}
    </AgentSkillConfigContext.Provider>
  );
};

export const useAgentSkillConfigContext = () =>
  useContext(AgentSkillConfigContext);
