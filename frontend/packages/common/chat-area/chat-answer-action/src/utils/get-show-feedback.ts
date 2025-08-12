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
  // Is it a pushed message?
  const isPushedMessage = getIsPushedMessage(message);
  if (isPushedMessage) {
    return false;
  }

  // The final answer from the last message group
  return (
    meta.isGroupLastAnswerMessage &&
    meta.isFromLatestGroup &&
    meta.sectionId === latestSectionId
  );
};
