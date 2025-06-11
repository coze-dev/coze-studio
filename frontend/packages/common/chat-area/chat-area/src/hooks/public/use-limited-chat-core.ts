import { useChatCore } from '../context/use-chat-core';

export const useLimitedChatCore: () => Pick<
  ReturnType<typeof useChatCore>,
  'reportMessage'
> = useChatCore;
