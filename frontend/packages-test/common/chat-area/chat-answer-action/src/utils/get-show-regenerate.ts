import { type Message, type MessageMeta } from '@coze-common/chat-area';

import { getIsPushedMessage } from './get-is-pushed-message';
import { getIsLastGroup } from './get-is-last-group';

export const getShowRegenerate = ({
  message,
  meta,
  latestSectionId,
}: {
  message: Pick<Message, 'type' | 'source'>;
  meta: Pick<MessageMeta, 'isFromLatestGroup' | 'sectionId'>;
  latestSectionId: string;
}): boolean => {
  // 是否是推送的消息
  const isPushedMessage = getIsPushedMessage(message);
  if (isPushedMessage) {
    return false;
  }

  // 来自最后一个消息组
  return getIsLastGroup({ meta, latestSectionId });
};
