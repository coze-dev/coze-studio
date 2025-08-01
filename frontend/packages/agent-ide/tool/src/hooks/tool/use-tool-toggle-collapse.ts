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

import { type AbilityKey } from '@coze-agent-ide/tool-config';

import { useEvent } from '../event/use-event';
import { EventCenterEventName } from '../../typings/scoped-events';
import { type IToggleContentBlockEventParams } from '../../typings/event';

/**
 * Private hooks, not exposed to the outside world
 * @returns
 */

export const useRegisterCollapse = () => {
  const { on } = useEvent();

  const registerCollapse = (
    listener: (isExpand: boolean) => void,
    abilityKey: AbilityKey,
  ) =>
    on<IToggleContentBlockEventParams>(
      EventCenterEventName.ToggleContentBlock,
      params => {
        const { abilityKey: currentAbilityKey, isExpand } = params;

        if (abilityKey === currentAbilityKey) {
          listener(isExpand);
        }
      },
    );

  return {
    registerCollapse,
  };
};
