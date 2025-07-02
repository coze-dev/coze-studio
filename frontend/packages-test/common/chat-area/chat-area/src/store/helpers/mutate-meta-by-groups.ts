import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import type { MessageGroup, MessageGroupMember, MessageMeta } from '../types';
import { flatMessageGroupIdList } from '../../utils/message-group/flat-message-group-list';
import { checkMessageHasUniqId } from '../../utils/message';

/**
 * 用于更新 meta.isLatestGroupAnswer
 */
export const mutateUpdateMetaByGroupInfo = (
  metaList: MessageMeta[],
  groupList: MessageGroup[],
): void => {
  mutateMetaIsLatestGroupAnswer(metaList, groupList);
  mutateMetaIsLastAnswerInItsGroup(metaList, groupList);
  mutateMetaIsLastAnswerMessage(metaList, groupList);
};

const mutateMetaIsLatestGroupAnswer = (
  metaList: MessageMeta[],
  groupList: MessageGroup[],
) => {
  const lastGroup = groupList.at(0);
  if (!lastGroup) {
    return;
  }

  const lastGroupMessageIdList = flatMessageGroupIdList([lastGroup]);
  const targetMetas = metaList.filter(meta =>
    lastGroupMessageIdList.some(id => checkMessageHasUniqId(meta, id)),
  );
  targetMetas.forEach(meta => (meta.isFromLatestGroup = true));
};

const mutateMetaIsLastAnswerInItsGroup = (
  metaList: MessageMeta[],
  groupList: MessageGroup[],
) => {
  groupList.forEach(({ memberSet }) => {
    const lastAnswerId = getLastMessageId(memberSet);
    if (!lastAnswerId) {
      return;
    }
    const meta = metaList.find(it => checkMessageHasUniqId(it, lastAnswerId));
    if (!meta) {
      safeAsyncThrow(`cannot find meta by group answer id ${lastAnswerId}`);
      return;
    }
    meta.isGroupLastMessage = true;
  });
};

const mutateMetaIsLastAnswerMessage = (
  metaList: MessageMeta[],
  groupList: MessageGroup[],
) => {
  groupList.forEach(({ memberSet }) => {
    const lastAnswerId = memberSet.llmAnswerMessageIdList.at(0);
    if (!lastAnswerId) {
      return;
    }
    const meta = metaList.find(it => checkMessageHasUniqId(it, lastAnswerId));
    if (!meta) {
      safeAsyncThrow(`cannot find meta by group answer id ${lastAnswerId}`);
      return;
    }
    meta.isGroupLastAnswerMessage = true;
  });
};

const getLastMessageId = ({
  llmAnswerMessageIdList,
  functionCallMessageIdList,
  userMessageId,
}: MessageGroupMember) => {
  const answerId = llmAnswerMessageIdList.at(0);
  if (answerId) {
    return answerId;
  }
  const functionCallId = functionCallMessageIdList.at(0);
  if (functionCallId) {
    return functionCallId;
  }
  return userMessageId;
};
