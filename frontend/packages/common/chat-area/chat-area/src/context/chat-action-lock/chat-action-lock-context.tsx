import { createContext } from 'react';

import { type ChatActionLockService } from '../../service/chat-action-lock';

export const ChatActionLockContext =
  createContext<ChatActionLockService | null>(null);
