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
