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
