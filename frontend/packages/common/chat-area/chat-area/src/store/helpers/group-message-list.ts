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

import { flatMapByKeyList } from '@coze-common/chat-area-utils';

import { type MessageGroup, type Message } from '../types';
import { checkNoneMessageGroupMemberLeft } from '../../utils/message-group/message-group-exhaustive-check';
import { getMessageUniqueKey } from '../../utils/message';
import { primitiveExhaustiveCheck } from '../../utils/exhaustive-check';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import { markGroupShowContextDivider } from './mark-group-context-divider';
import { getDefaultDistributeMemberSetType } from './get-default-distribute-merber-set-type';
/**
 * The message_id of the query is the same as the answer reply_id coze home and bot store
 */
const getMessageGroupId = (message: Message) => {
  if (message.role === 'assistant') {
    return message.reply_id;
  }
  return message.message_id || message.extra_info.local_message_id;
};

const makeGroup = (groupId: string, sectionId: string): MessageGroup => ({
  groupId,
  sectionId,
  isLatest: false,
  showContextDivider: null,
  memberSet: {
    userMessageId: '',
    functionCallMessageIdList: [],
    llmAnswerMessageIdList: [],
    followUpMessageIdList: [],
  },
});

export const groupMessageList = (
  messageList: Message[],
  lifeCycleService: SystemLifeCycleService,
): MessageGroup[] => {
  const reversedGroupIdList: string[] = [];
  const groupMap = new Map<string, MessageGroup>();

  const produceGroup = (groupId: string, sectionId: string) => {
    const isExistingGroup = reversedGroupIdList.includes(groupId);
    if (!isExistingGroup) {
      const group = makeGroup(groupId, sectionId);
      groupMap.set(groupId, group);
      reversedGroupIdList.push(groupId);
      return group;
    }
    const group = groupMap.get(groupId);
    if (!group) {
      throw new Error(`fail to get back group of ${groupId}`);
    }
    return group;
  };

  const scanMessageToMakeGroups = (message: Message) => {
    const groupId = getMessageGroupId(message);
    const modifiedGroup = produceGroup(groupId, message.section_id);
    if (!modifiedGroup) {
      return;
    }

    const defaultMemberSetType = getDefaultDistributeMemberSetType({ message });

    /**
     * Lifecycle of a distribution message type
     */
    const { memberSetType = defaultMemberSetType } =
      lifeCycleService.message.onBeforeDistributeMessageIntoMemberSet({
        ctx: {
          message,
          memberSetType: defaultMemberSetType,
        },
      });

    if (!memberSetType) {
      throw new Error('fail to get member set type');
    }

    switch (memberSetType) {
      case 'user': {
        modifiedGroup.memberSet.userMessageId = getMessageUniqueKey(message);
        break;
      }
      case 'llm': {
        modifiedGroup.memberSet.llmAnswerMessageIdList.push(
          getMessageUniqueKey(message),
        );
        break;
      }
      case 'function_call': {
        modifiedGroup.memberSet.functionCallMessageIdList.push(
          getMessageUniqueKey(message),
        );
        break;
      }
      case 'follow_up': {
        modifiedGroup.memberSet.followUpMessageIdList.push(
          getMessageUniqueKey(message),
        );
        break;
      }
      default:
        primitiveExhaustiveCheck(memberSetType);
        break;
    }
  };

  // Messages are the latest at the beginning, but the aggregation logic is on a first-come, first-served basis, so the aggregation is reversed
  for (let i = messageList.length - 1; i > -1; i--) {
    const message = messageList.at(i);
    if (!message) {
      throw new Error('fail to iterate scanMessageToMakeGroups');
    }
    scanMessageToMakeGroups(message);
  }

  // BTW reverse is actually a mutated method
  const groupIdList = reversedGroupIdList.reverse();
  const messageGroupList = flatMapByKeyList(groupMap, groupIdList);
  messageGroupList.forEach(reverseMemberSet);
  scanGroupsToMarkContextDividers(messageGroupList, messageList);
  markLatestGroup(messageGroupList);
  return messageGroupList;
};

// mutate
const reverseMemberSet = (group: MessageGroup) => {
  const {
    functionCallMessageIdList,
    llmAnswerMessageIdList,
    userMessageId,
    followUpMessageIdList,
    ...rest
  } = group.memberSet;
  checkNoneMessageGroupMemberLeft(rest);
  functionCallMessageIdList.reverse();
  llmAnswerMessageIdList.reverse();
  followUpMessageIdList.reverse();
};

// new -> old
const scanGroupsToMarkContextDividers = (
  groups: MessageGroup[],
  messages: Message[],
) => {
  for (let i = 0; i < groups.length - 1; i++) {
    const curGroup = groups.at(i);
    const prevGroup = groups.at(i + 1);
    if (!curGroup || !prevGroup) {
      throw new Error('impossible scanGroupsToMarkContextDividers');
    }
    markGroupShowContextDivider({
      group: prevGroup,
      isShow: curGroup.sectionId !== prevGroup.sectionId,
      messages,
    });
  }
};

function markLatestGroup(messageGroupList: MessageGroup[]) {
  const latestGroup = messageGroupList.at(0);
  if (latestGroup) {
    latestGroup.isLatest = true;
  }
}
