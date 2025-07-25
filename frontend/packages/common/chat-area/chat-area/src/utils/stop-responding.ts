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
 
import type ChatCore from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';

import { type WaitingStore, type Waiting } from '../store/waiting';
import { type Message } from '../store/types';
import { type MessagesStore } from '../store/messages';
import { ReportEventNames, getReportError } from '../report-events';
import { type SystemLifeCycleService } from '../plugin/life-cycle';
import { StopRespondingErrorScene } from '../plugin/constants/life-cycle-context';
import { getLastPureAnswerMessage } from '../hooks/messages/use-anwer-message-helper';
import { type StoreSet } from '../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../context/chat-area-context/chat-area-callback';
import { getMessagesByGroup } from './message-group/get-message-by-group';
import { findMessageById } from './message';

/**
 * @deprecated 没有地方使用了
 */
export const getBreakRespondingInfo = (param: {
  responding: ReturnType<WaitingStore['getState']>['responding'];
  messages: Message[];
}) => {
  const { responding, messages } = param;
  if (!responding) {
    return null;
  }
  const { replyId, response } = responding;
  // 提问message
  const questionMessage = findMessageById(messages, replyId);
  // 回答message
  const respondingMessages = response
    .map(({ id }) => findMessageById(messages, id))
    .filter((m): m is Message => !!m);
  return {
    questionMessage,
    respondingMessages,
  };
};

export const breakAccurately = async ({
  finalAnswer,
  waiting,
  chatCore,
  reporter,
}: {
  finalAnswer: Message;
  waiting: Waiting | null;
  chatCore: ChatCore;
  reporter: Reporter;
}) => {
  try {
    await chatCore.breakMessage({
      query_message_id: waiting?.replyId || '',
      local_message_id: waiting?.questionLocalMessageId || '',
      answer_message_id: finalAnswer.message_id || '',
      broken_pos: finalAnswer.content?.length || 0,
    });
    reporter.successEvent({ eventName: ReportEventNames.BreakMessage });
  } catch (e) {
    reporter.errorEvent({
      eventName: ReportEventNames.BreakMessage,
      ...getReportError(e),
    });
  }
};

export const breakGenerally = async ({
  waiting,
  chatCore,
  reporter,
}: {
  waiting: Waiting | null;
  chatCore: ChatCore;
  reporter: Reporter;
}) => {
  try {
    await chatCore.breakMessage({
      query_message_id: waiting?.replyId || '',
      // 如果进入了 suggestion 生成阶段，应该不需要回落到 local message id
      local_message_id: waiting?.questionLocalMessageId || '',
    });
    reporter.successEvent({
      eventName: ReportEventNames.BreakMessageAccurately,
    });
  } catch (e) {
    reporter.errorEvent({
      eventName: ReportEventNames.BreakMessageAccurately,
      ...getReportError(e),
    });
  }
};

// 打断消息，break当前回复
export const stopResponding = async (context: {
  storeSet: Pick<
    StoreSet,
    'useWaitingStore' | 'useMessagesStore' | 'useGlobalInitStore'
  >;
  eventCallback?: Pick<ChatAreaEventCallback, 'onAfterStopResponding'>;
  reporter: Reporter;
  lifeCycleService: SystemLifeCycleService;
}) => {
  const {
    storeSet: { useGlobalInitStore, useMessagesStore, useWaitingStore },
    reporter,
    lifeCycleService,
  } = context;
  await lifeCycleService.command.onBeforeStopResponding();
  const chatCore = useGlobalInitStore.getState().getChatCore();
  const { waiting, clearAllUnsettledUnconditionally } =
    useWaitingStore.getState();
  const { updateMessage } = useMessagesStore.getState();

  const finalAnswer = getLastPureAnswerMessage(
    useMessagesStore,
    waiting?.replyId,
  );

  if (!waiting) {
    // 可能正常的，未在对话中
    console.log('call stop, but not found waiting');
    await lifeCycleService.command.onStopRespondingError({
      ctx: {
        scene: StopRespondingErrorScene.NoWaiting,
      },
    });
    return;
  }

  clearAllUnsettledUnconditionally();

  // 多条answer情况,只找最新的answer
  try {
    if (finalAnswer) {
      await breakAccurately({ waiting, finalAnswer, chatCore, reporter });
      updateMessage({ ...finalAnswer, is_finish: true });
    } else {
      await breakGenerally({ waiting, chatCore, reporter });
    }
  } catch {
    await lifeCycleService.command.onStopRespondingError({
      ctx: {
        scene: StopRespondingErrorScene.CatchError,
      },
    });
  }
  invokeOnAfterStopRespondingCallback(waiting.replyId, context);
};

/** waiting replyId 必须传入旧的，不能从 store 中读取 */
const invokeOnAfterStopRespondingCallback = async (
  brokenReplyId: string,
  chatAreaContext: {
    eventCallback?: Pick<ChatAreaEventCallback, 'onAfterStopResponding'>;
    storeSet: Pick<Required<StoreSet>, 'useMessagesStore'>;
    lifeCycleService: SystemLifeCycleService;
  },
) => {
  const {
    eventCallback: { onAfterStopResponding: onAfterStopRespondingOld } = {},
    storeSet: { useMessagesStore },
    lifeCycleService,
  } = chatAreaContext;

  const ctx = {
    brokenReplyId,
    brokenFlattenMessageGroup: getBreakFlattenMessageGroup(
      brokenReplyId,
      useMessagesStore,
    ),
  };

  onAfterStopRespondingOld?.(ctx);
  await lifeCycleService.command.onAfterStopResponding({
    ctx,
  });
};

export const getBreakFlattenMessageGroup = (
  brokenReplyId: string,
  useMessagesStore: MessagesStore,
): null | Message[] => {
  const { getMessageGroupById, messages } = useMessagesStore.getState();
  const group = getMessageGroupById(brokenReplyId);
  if (!group) {
    return null;
  }
  return getMessagesByGroup(group, messages);
};
