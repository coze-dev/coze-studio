import { PromptType } from '@coze-arch/bot-api/developer_api';

export function replacedBotPrompt(data) {
  return [
    {
      prompt_type: PromptType.SYSTEM,
      data: data.data,
      record_id: data.record_id,
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
}
