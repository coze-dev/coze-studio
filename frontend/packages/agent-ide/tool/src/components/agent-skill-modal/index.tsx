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

import { type FC } from 'react';

// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { type AgentModalTabKey } from '@coze-agent-ide/tool-config/src/types';
import { AbilityScope } from '@coze-agent-ide/tool-config';
import { UITabsModal } from '@coze-arch/bot-semi';
import { type ModalProps } from '@douyinfe/semi-foundation/lib/es/modal/modalFoundation';

import { ToolContainer } from '../tool-container';
import { useAgentModalTriggerEvent } from '../../hooks/agent-skill-modal/use-agent-modal-trigger-event';

export interface IAgentSkillModalPane {
  key: AgentModalTabKey;
  tab: React.ReactNode;
  pane: React.ReactNode;
}

interface AgentSkillModalProps extends Partial<ModalProps> {
  tabPanes: IAgentSkillModalPane[];
}

export const AgentSkillModal: FC<AgentSkillModalProps> = ({
  tabPanes,
  ...restModalProps
}) => {
  const { emitTabChangeEvent } = useAgentModalTriggerEvent();
  return (
    <UITabsModal
      visible
      tabs={{
        tabsProps: {
          lazyRender: true,
          onChange: activityKey =>
            emitTabChangeEvent(activityKey as AgentModalTabKey),
        },
        tabPanes: tabPanes.map(tab => ({
          tabPaneProps: {
            tab: tab.tab,
            itemKey: tab.key,
          },
          content: (
            <ToolContainer scope={AbilityScope.AGENT_SKILL}>
              <>{tab.pane}</>
            </ToolContainer>
          ),
        })),
      }}
      {...restModalProps}
    />
  );
};
