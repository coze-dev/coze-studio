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
