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
 
import { VerboseMsgType } from '@coze-common/chat-core';

import { type MessageMeta } from '../types';

/**
 *
 * @param metaList
 */
export const addJumpVerboseInfo = (metaList: MessageMeta[]) => {
  // 从后向前扫描, 遇到jumpVerbose消息，设置相同的reply_id的answer消息的hasJumpVerbose为true
  let lastJumpVerboseMeta = null;
  for (let i = metaList.length - 1; i >= 0; i--) {
    const current = metaList[i];
    if (!current) {
      continue;
    }
    if (current.verboseMsgType === VerboseMsgType.JUMP_TO) {
      lastJumpVerboseMeta = current;
      continue;
    }

    const isSameGroup =
      lastJumpVerboseMeta && current.replyId === lastJumpVerboseMeta.replyId;
    const isAnswer = current.type === 'answer';

    if (isSameGroup && isAnswer) {
      current.beforeHasJumpVerbose = true;
    }
  }
};
