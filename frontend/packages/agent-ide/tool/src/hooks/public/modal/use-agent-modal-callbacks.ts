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
