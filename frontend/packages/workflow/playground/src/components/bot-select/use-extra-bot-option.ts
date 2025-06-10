import { useMemo } from 'react';

import { transformBotInfo, useBotInfo } from './use-bot-info';
import type { IBotSelectOption } from './types';

export const useExtraBotOption = (
  botOptionList: IBotSelectOption[],
  currentBotValue?: string,
): IBotSelectOption | undefined => {
  const { botInfo } = useBotInfo(currentBotValue);
  return useMemo(() => {
    const botFinded = botOptionList.find(
      ({ value }) => value === currentBotValue,
    );

    if (!botFinded) {
      return transformBotInfo.basicInfo(botInfo);
    }
    return undefined;
  }, [botOptionList, botInfo]);
};
