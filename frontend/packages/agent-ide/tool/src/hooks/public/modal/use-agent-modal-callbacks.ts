// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { type AgentModalTabKey } from '@coze-agent-ide/tool-config/src/types';

import { useEvent } from '../../event/use-event';
import { EventCenterEventName } from '../../../typings/scoped-events';
import {
  type IAgentModalTabChangeEventParams,
  type IAgentModalVisibleChangeEventParams,
} from '../../../typings/event';

export const useAgentSkillModalCallbacks = () => {
  const { on } = useEvent();
  const onTabChange = (listener: (tabKey: AgentModalTabKey) => void) => {
    on<IAgentModalTabChangeEventParams>(
      EventCenterEventName.AgentModalTabChange,
      params => {
        const { tabKey } = params;
        listener(tabKey);
      },
    );
  };

  const onModalVisibleChange = (listener: (isVisible: boolean) => void) => {
    on<IAgentModalVisibleChangeEventParams>(
      EventCenterEventName.AgentModalVisibleChange,
      params => {
        const { isVisible } = params;
        listener(isVisible);
      },
    );
  };

  return {
    onTabChange,
    onModalVisibleChange,
  };
};
