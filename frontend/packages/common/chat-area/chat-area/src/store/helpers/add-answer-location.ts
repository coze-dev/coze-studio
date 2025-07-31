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

import { type MessageMeta } from '../types';

export const addAnswerLocation = (metaList: MessageMeta[]) => {
  const answerMessageMeta = metaList.filter(meta => meta.type === 'answer');
  // Scan from backwards to forwards, encounter the first different reply_id, restart setting isFirstAnswer
  let lastAnswerMeta = null;
  for (let i = answerMessageMeta.length - 1; i >= 0; i--) {
    const current = answerMessageMeta[i];
    if (!current) {
      continue;
    }
    if (!lastAnswerMeta) {
      current.isGroupFirstAnswer = true;
      lastAnswerMeta = current;
      continue;
    }

    if (current.replyId !== lastAnswerMeta.replyId) {
      current.isGroupFirstAnswer = true;
      lastAnswerMeta = current;
    }
  }
};
