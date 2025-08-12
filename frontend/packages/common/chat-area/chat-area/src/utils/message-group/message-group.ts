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

import { isEqual } from 'lodash-es';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';
import { type Reporter } from '@coze-arch/logger';

import { isJumpToVerbose } from '../verbose';
import { stopResponding } from '../stop-responding';
import { findMessageById } from '../message';
import { FileManagerEventNames, fileManager } from '../file-manage';
import { type Message, type MessageGroup } from '../../store/types';
import { type ChatActionLockService } from '../../service/chat-action-lock';
import { ReportEventNames, getReportError } from '../../report-events';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import { type StoreSet } from '../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../context/chat-area-context/chat-area-callback';
import { checkNoneMessageGroupMemberLeft } from './message-group-exhaustive-check';

export const findMessageGroupById = (
  messageGroupList: MessageGroup[],
  groupId: string,
) => {
  if (!groupId) {
    return;
  }
  return messageGroupList.find(group => group.groupId === groupId);
};

export const findMessageGroupByUserMessageId = (
  messageGroupList: MessageGroup[],
  userMessageId: string,
) => {
  if (!userMessageId) {
    return;
  }
  return messageGroupList.find(
    group => group.memberSet.userMessageId === userMessageId,
  );
};

export const isMessageGroupEqual = (
  oldGroup: MessageGroup | undefined,
  newGroup: MessageGroup | undefined,
) => isEqual(oldGroup, newGroup);

// eslint-disable-next-line max-lines-per-function -- 0
export const deleteMessageGroupById = async (
  groupId: string,
  context: {
    reporter: Reporter;
    storeSet: Pick<
      StoreSet,
      | 'useMessagesStore'
      | 'useMessageMetaStore'
      | 'useSuggestionsStore'
      | 'useWaitingStore'
      | 'useGlobalInitStore'
    >;
    eventCallback?: Pick<
      ChatAreaEventCallback,
      'onAfterStopResponding' | 'onDeleteMessage'
    >;
    lifeCycleService: SystemLifeCycleService;
    chatActionLockService: ChatActionLockService;
  },
) => {
  const {
    storeSet,
    reporter,
    eventCallback,
    lifeCycleService,
    chatActionLockService,
  } = context;
  if (
    chatActionLockService.answerAction.getIsLock(groupId, 'deleteMessageGroup')
  ) {
    return;
  }
  const {
    useMessagesStore,
    useMessageMetaStore,
    useSuggestionsStore,
    useGlobalInitStore,
  } = storeSet;
  const chatCore = useGlobalInitStore.getState().getChatCore();
  const { getMessageGroupById, findMessage, isLastMessageGroup } =
    useMessagesStore.getState();
  const { clearSuggestions } = useSuggestionsStore.getState();

  const { getMetaByMessage } = useMessageMetaStore.getState();

  const messageGroup = getMessageGroupById(groupId);

  if (!messageGroup) {
    safeAsyncThrow(`message group not found, id: ${groupId}`);
    return;
  }

  chatActionLockService.answerAction.lock(groupId, 'deleteMessageGroup');

  const {
    memberSet: {
      userMessageId,
      llmAnswerMessageIdList,
      functionCallMessageIdList,
      followUpMessageIdList,
      ...rest
    },
  } = messageGroup;

  checkNoneMessageGroupMemberLeft(rest);

  const userMessage = userMessageId ? findMessage(userMessageId) : void 0;

  const userMessageMeta = userMessageId
    ? getMetaByMessage(userMessageId)
    : void 0;

  const isLast = isLastMessageGroup(groupId);

  const { deleteMessageByIdList, deleteMessageById } =
    useMessagesStore.getState();

  try {
    await lifeCycleService.message.onBeforeDeleteMessage({
      ctx: {
        messageGroup,
      },
    });

    if (userMessage) {
      fileManager.emit(
        FileManagerEventNames.CANCEL_UPLOAD_FILE,
        userMessage.extra_info.local_message_id,
      );
    }

    /**
     * Normal conversation scene and llm answer separate group scene
     */
    const expectToDeleteMessageId =
      userMessageId || llmAnswerMessageIdList.at(0);

    if (!expectToDeleteMessageId) {
      throw new Error(
        `failed to find message to delete ${expectToDeleteMessageId}`,
      );
    }

    await Promise.all([
      chatCore.deleteMessage({
        message_id: expectToDeleteMessageId,
      }),
      userMessageMeta?.isGroupLastMessage && stopResponding(context),
    ]);

    if (userMessageId) {
      deleteMessageById(userMessageId);
    }
    deleteMessageByIdList(functionCallMessageIdList);
    deleteMessageByIdList(llmAnswerMessageIdList);
    deleteMessageByIdList(followUpMessageIdList);

    if (isLast) {
      clearSuggestions();
    }

    eventCallback?.onDeleteMessage?.({
      messageGroup,
    });
    await lifeCycleService.message.onAfterDeleteMessage({
      ctx: {
        messageGroup,
      },
    });

    reporter.successEvent({ eventName: ReportEventNames.DeleteMessage });
  } catch (e) {
    await lifeCycleService.message.onDeleteMessageError({
      messageGroup,
    });
    reporter.errorEvent({
      eventName: ReportEventNames.DeleteMessage,
      ...getReportError(e),
    });
  } finally {
    chatActionLockService.answerAction.unlock(groupId, 'deleteMessageGroup');
  }
};

// Is the message received the first answer?
export const isGroupFirstAnswer = (
  messageGroupList: MessageGroup[],
  messages: Message[],
  message: Message,
) => {
  if (message.type !== 'answer') {
    return false;
  }
  // Find the corresponding group according to the message
  const targetGroup = messageGroupList.find(
    ({ memberSet }) => memberSet.userMessageId === message.reply_id,
  );
  if (!targetGroup) {
    return false;
  }
  const answers = targetGroup.memberSet.llmAnswerMessageIdList
    .map(id => findMessageById(messages, id))
    .map(m => m?.type === 'answer' && m);
  // There is no first answer, indicating that the current answer is the first
  const hasNoAnswer = answers.length === 0;
  const firstAnswer = answers.at(-1) || null;
  const isFirstAnswer = firstAnswer?.message_id === message.message_id;
  return hasNoAnswer || isFirstAnswer;
};

export const findGroupJumpVerbose = (
  messageGroupList: MessageGroup[],
  messages: Message[],
  message: Message,
) => {
  const targetGroup = messageGroupList.find(
    group => group.memberSet.userMessageId === message.reply_id,
  );
  if (!targetGroup) {
    return;
  }
  return targetGroup.memberSet.functionCallMessageIdList
    .map(id => findMessageById(messages, id))
    .find(m => m && isJumpToVerbose(m) && m);
};
