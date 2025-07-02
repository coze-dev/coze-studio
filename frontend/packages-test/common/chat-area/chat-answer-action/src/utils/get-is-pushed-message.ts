import {
  type Message,
  getIsNotificationMessage,
  getIsTriggerMessage,
  getIsAsyncResultMessage,
} from '@coze-common/chat-area';

export const getIsPushedMessage = (
  message: Pick<Message, 'type' | 'source'>,
): boolean =>
  getIsTriggerMessage(message) ||
  getIsNotificationMessage(message) ||
  getIsAsyncResultMessage(message);
