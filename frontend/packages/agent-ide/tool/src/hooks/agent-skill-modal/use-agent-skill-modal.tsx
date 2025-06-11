import { useState } from 'react';

import {
  AgentSkillModal,
  type IAgentSkillModalPane,
} from '../../components/agent-skill-modal';
import { useAgentModalTriggerEvent } from './use-agent-modal-trigger-event';

export const useAgentSkillModal = (tabPanes: IAgentSkillModalPane[]) => {
  const [visible, setVisible] = useState(false);

  const { emitModalVisibleChangeEvent } = useAgentModalTriggerEvent();
  const close = () => {
    setVisible(false);
    emitModalVisibleChangeEvent(false);
  };
  const open = () => {
    setVisible(true);
    emitModalVisibleChangeEvent(true);
  };
  return {
    node: visible ? (
      <AgentSkillModal tabPanes={tabPanes} onCancel={close} />
    ) : null,
    close,
    open,
  };
};
