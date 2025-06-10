import { type Variable } from '@coze-arch/bot-api/playground_api';

import { transformBotInfo, useBotInfo } from './use-bot-info';

export const useVariables = (botID?: string) => {
  const { botInfo, isLoading } = useBotInfo(botID);
  const variables: Variable[] | undefined = transformBotInfo.variable(botInfo);

  return {
    variables,
    isLoading,
  };
};
