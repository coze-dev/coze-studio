import type { BotPrompt, PromptType } from '@coze-arch/bot-api/developer_api';

export interface RequiredBotPrompt extends BotPrompt {
  prompt_type: PromptType;
  data: string;
  isOptimize: boolean;
  record_id?: string;
}
