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

import { useMemo } from 'react';

import { IntelligenceType } from '@coze-arch/idl/intelligence_api';

import { useProjectItemInfo } from './use-project-info';
import { transformBotInfo, useBotInfo } from './use-bot-info';
import type { IBotSelectOption, ValueType } from './types';

export const useExtraBotOption = (
  botOptionList: IBotSelectOption[],
  currentBotValue?: string,
  isBot?: boolean,
  handleChange?: (botInfo?: IBotSelectOption, _value?: ValueType) => void,
  // eslint-disable-next-line max-params
): IBotSelectOption | undefined => {
  const { botInfo } = useBotInfo(isBot ? currentBotValue : undefined);
  const { projectItemInfo } = useProjectItemInfo(
    !isBot ? currentBotValue : undefined,
  );

  const botValue = useMemo(() => {
    const botFinded = botOptionList.find(
      ({ value }) => value === currentBotValue,
    );

    if (!botFinded) {
      const botItem = transformBotInfo.basicInfo(botInfo);
      if (botItem) {
        handleChange?.(botItem, {
          id: botItem.value,
          type: botItem.type,
        });
      }
      return botItem;
    }
    return undefined;
  }, [botOptionList, botInfo, currentBotValue]);

  const projectValue = useMemo(() => {
    const projectFinded = botOptionList.find(
      ({ value }) => value === currentBotValue,
    );
    if (projectFinded) {
      return undefined;
    }
    let projectItem;
    if (projectItemInfo) {
      projectItem = {
        name: projectItemInfo?.basic_info?.name || '',
        value: projectItemInfo?.basic_info?.id || '',
        avatar: projectItemInfo?.basic_info?.icon_url || '',
        type: IntelligenceType.Project,
      };
      handleChange?.(projectItem, {
        id: projectItem.value,
        type: projectItem.type,
      });
    }
    return projectItem;
  }, [projectItemInfo, botOptionList, currentBotValue]);

  return isBot ? botValue : projectValue;
};
