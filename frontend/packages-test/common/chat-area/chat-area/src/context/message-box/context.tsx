import { createContext } from 'react';

import { type MessageMeta, type Message } from '../../store/types';

// TODO 可以再优化
export interface MessageBoxContextProviderProps {
  messageUniqKey: string;
  groupId: string;
  message: Message | undefined;
  meta: MessageMeta | undefined;
  regenerateMessage: () => Promise<void>;
  isFirstUserOrFinalAnswerMessage: boolean;
  isLastUserOrFinalAnswerMessage: boolean;
  functionCallMessageIdList?: string[];
  /** 这条消息属于的 group 是否正在进行对话 */
  isGroupChatActive: boolean;
}

export const MessageBoxContext = createContext<MessageBoxContextProviderProps>({
  messageUniqKey: '',
  groupId: '',
  regenerateMessage: () => Promise.resolve(),
  isFirstUserOrFinalAnswerMessage: false,
  isLastUserOrFinalAnswerMessage: false,
  message: undefined,
  meta: undefined,
  isGroupChatActive: false,
});
