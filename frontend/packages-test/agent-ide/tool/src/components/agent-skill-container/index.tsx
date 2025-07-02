import { ErrorBoundary } from 'react-error-boundary';
import { type FC, type PropsWithChildren } from 'react';

import { AbilityScope, type AgentSkillKey } from '@coze-agent-ide/tool-config';

import { AbilityConfigContextProvider } from '../../context/ability-config-context';

interface IProps {
  agentSkillKey?: AgentSkillKey;
}

export const AgentSkillContainer: FC<PropsWithChildren<IProps>> = ({
  children,
  agentSkillKey,
}) => (
  <ErrorBoundary fallback={<div>error</div>}>
    <AbilityConfigContextProvider
      abilityKey={agentSkillKey}
      scope={AbilityScope.AGENT_SKILL}
    >
      {children}
    </AbilityConfigContextProvider>
  </ErrorBoundary>
);
