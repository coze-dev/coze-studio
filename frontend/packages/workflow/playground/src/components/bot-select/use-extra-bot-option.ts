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
