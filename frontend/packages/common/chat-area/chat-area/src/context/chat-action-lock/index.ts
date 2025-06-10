import { useContext } from 'react';

import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import {
  fallbackChatActionLockService,
  type ChatActionLockService,
} from '../../service/chat-action-lock';
import { ChatActionLockContext } from './chat-action-lock-context';

export const useChatActionLockService: () => ChatActionLockService = () => {
  const lockService = useContext(ChatActionLockContext);
  if (!lockService) {
    safeAsyncThrow('ChatActionLockService not provided');
    return fallbackChatActionLockService;
  }
  return lockService;
};
