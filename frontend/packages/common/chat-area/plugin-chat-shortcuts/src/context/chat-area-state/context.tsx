import { createContext } from 'react';

export const ChatAreaStateContext = createContext<{
  isSendMessageLock: boolean;
}>({ isSendMessageLock: false });
