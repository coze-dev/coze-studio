import { type BotPrompt, PromptType } from '@coze-arch/bot-api/developer_api';

import { usePersonaStore } from '../store/persona';

export interface SaveBotPrompt extends BotPrompt {
  id: string;
}

export const getReplacedBotPrompt = () => {
  const { systemMessage } = usePersonaStore.getState();

  return [
    {
      prompt_type: PromptType.SYSTEM,
      data: systemMessage.data,
    },
    {
      prompt_type: PromptType.USERPREFIX,
      data: '',
    },
    {
      prompt_type: PromptType.USERSUFFIX,
      data: '',
    },
  ];
};
