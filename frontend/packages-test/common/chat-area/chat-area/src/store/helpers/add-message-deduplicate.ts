/**
 * 新增数据时，筛出不重复的部分
 */

import { type Message } from '../types';

export const filterDeduplicateMessage = (
  all: Message[],
  added: Message[],
): Message[] => {
  const messageIdSet = new Set(
    all.map(msg => msg.message_id).filter(id => !!id),
  );
  const localMessageIdSet = new Set(
    all.map(msg => msg.extra_info.local_message_id).filter(id => !!id),
  );
  return added.filter(
    msg =>
      !messageIdSet.has(msg.message_id) &&
      !localMessageIdSet.has(msg.extra_info.local_message_id),
  );
};
