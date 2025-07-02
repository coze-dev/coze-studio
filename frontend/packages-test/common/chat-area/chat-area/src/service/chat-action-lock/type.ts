import { type Reporter } from '@coze-arch/logger';

import {
  type GlobalActionType,
  type GlobalActionLock,
  type GlobalActionLockUpdateFn,
  type AnswerActionLockMapUpdateFn,
  type AnswerActionLockMap,
  type ChatActionStoreAction,
} from '../../store/chat-action';

export interface GlobalLockParamsMap {
  sendMessageToACK: { messageUniqKey: string };
  clearHistory: null;
  clearContext: null;
}

export type GetGlobalActionLockUpdateFn<T extends GlobalActionType> = (props: {
  timestamp: number;
  param: GlobalLockParamsMap[T];
}) => GlobalActionLockUpdateFn;

export type GetIsGlobalActionLockFn = (
  globalActionLock: GlobalActionLock,
) => boolean;

export type GetAnswerActionLockUpdateFn = (
  groupId: string,
  props: {
    timestamp: number;
  },
) => AnswerActionLockMapUpdateFn;

export type GetAnswerActionUnLockUpdateFn = (
  groupId: string,
) => AnswerActionLockMapUpdateFn;

export type GetIsAnswerActionLockFn = (
  groupId: string,
  answerActionLockMap: AnswerActionLockMap,
  globalActionLock: GlobalActionLock,
) => boolean;

export interface ChatActionLockEnvValues {
  enableChatActionLock: boolean;
}

export interface ChatActionLockServiceConstructor {
  updateGlobalActionLockByImmer: ChatActionStoreAction['updateGlobalActionLockByImmer'];
  getGlobalActionLock: ChatActionStoreAction['getGlobalActionLock'];
  updateAnswerActionLockMapByImmer: ChatActionStoreAction['updateAnswerActionLockMapByImmer'];
  getAnswerActionLockMap: ChatActionStoreAction['getAnswerActionLockMap'];
  readEnvValues: () => ChatActionLockEnvValues;
  reporter: Pick<Reporter, 'info'>;
}
