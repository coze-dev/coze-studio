import { type MessageType } from '@coze-common/chat-core';

export const MESSAGE_TYPE_VALID_IN_TEXT_LIST: Omit<MessageType[], ''> = [
  'answer',
  'question',
  'ack',
  'task_manual_trigger',
];
