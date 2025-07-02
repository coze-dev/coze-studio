import { type Message, type MessageMeta } from '@coze-common/chat-area';

import { getIsPushedMessage } from './get-is-pushed-message';

export const getShowFeedback = ({
  message,
  meta,
  latestSectionId,
}: {
  message: Pick<Message, 'type' | 'source'>;
  meta: Pick<
    MessageMeta,
    'isFromLatestGroup' | 'sectionId' | 'isGroupLastAnswerMessage'
  >;
  latestSectionId: string;
}): boolean => {
  // 是否是推送的消息
  const isPushedMessage = getIsPushedMessage(message);
  if (isPushedMessage) {
    return false;
  }

  // 来自最后一个消息组的 final answer
  return (
    meta.isGroupLastAnswerMessage &&
    meta.isFromLatestGroup &&
    meta.sectionId === latestSectionId
  );
};
