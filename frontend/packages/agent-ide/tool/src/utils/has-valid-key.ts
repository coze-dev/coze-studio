import React, { type ReactElement, type ReactNode } from 'react';

import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

export function hasValidAgentSkillKey(
  child: ReactNode,
): child is ReactElement<unknown> & { key: AgentSkillKey } {
  return (
    React.isValidElement(child) &&
    child.key !== null &&
    typeof child.key === 'string'
  );
}
