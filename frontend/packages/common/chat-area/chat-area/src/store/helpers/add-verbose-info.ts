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
