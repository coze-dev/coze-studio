import { type MessageMeta } from '../types';

export const addAnswerLocation = (metaList: MessageMeta[]) => {
  const answerMessageMeta = metaList.filter(meta => meta.type === 'answer');
  // 从后向前扫描，遇到第一个不同的reply_id，重新开始设置 isFirstAnswer
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
