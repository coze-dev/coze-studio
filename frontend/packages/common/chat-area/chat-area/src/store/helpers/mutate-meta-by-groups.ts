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

import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import type { MessageGroup, MessageGroupMember, MessageMeta } from '../types';
import { flatMessageGroupIdList } from '../../utils/message-group/flat-message-group-list';
import { checkMessageHasUniqId } from '../../utils/message';

/**
 * Use to update meta.isLatestGroupAnswer
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
