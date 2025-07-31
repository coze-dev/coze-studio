/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
