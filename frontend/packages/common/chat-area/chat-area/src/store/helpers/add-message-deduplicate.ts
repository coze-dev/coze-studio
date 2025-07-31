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

/**
 * When adding data, filter out non-duplicate parts
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
