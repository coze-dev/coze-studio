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
