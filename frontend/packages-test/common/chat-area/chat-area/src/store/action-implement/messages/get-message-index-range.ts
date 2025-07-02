import { getMinMax } from '@coze-common/chat-area-utils';

import type { Message } from '../../types';
import { type MessageIndexRange } from '../../messages';

export const getIsValidMessageIndex = (index?: string): index is string =>
  index !== undefined && index !== '0' && /^\d+$/.test(index);

const getIsMessageWithValidIndex = <T extends Pick<Message, 'message_index'>>(
  msg: T,
): msg is T & { message_index: string } =>
  getIsValidMessageIndex(msg.message_index);

export const getMessageIndexRange = (
  messages: Pick<Message, 'message_index'>[],
): MessageIndexRange => {
  const validMessages = messages.filter(getIsMessageWithValidIndex);
  const withNoIndexed = validMessages.length !== messages.length;
  const validIndexes = validMessages.map(msg => msg.message_index);

  const res = getMinMax(...validIndexes);

  return {
    withNoIndexed,
    min: res?.min,
    max: res?.max,
  };
};
