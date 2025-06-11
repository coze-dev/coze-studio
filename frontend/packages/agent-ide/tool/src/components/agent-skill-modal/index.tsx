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
          // 这里onChange没给泛型，就凑合用叭 as 一个string而已
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
