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

import ChatCore, {
  type SdkMessageEvent,
  type SdkPullingStatusEvent,
} from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';
import { APIErrorEvent, emitAPIErrorEvent } from '@coze-arch/bot-http';
import { Toast } from '@coze-arch/coze-design';

import { getIsSuggestion } from '../utils/suggestions';
import {
  clearUserMessageAndContextStrategy,
  updateStoreSectionIdStrategy,
  type SecurityStrategyContext,
} from '../utils/message-security-strategy';
import { findMessagesByReplyId } from '../utils/message';
import { localLog } from '../utils/local-log';
import { type WaitingStore } from '../store/waiting';
import { type Message } from '../store/types';
import { type SuggestionsStore } from '../store/suggestions';
import { type SectionIdStore } from '../store/section-id';
import { type MessagesStore } from '../store/messages';
import { type SystemLifeCycleService } from '../plugin/life-cycle';
import { type ChatAreaConfigs } from '../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../context/chat-area-context/chat-area-callback';
import { getShouldDropMessage } from './ignore-message';
import {
  ChatBusinessErrorCode,
  CozeTokenInsufficient,
  isToastErrorMessage,
  parseErrorInfoFromErrorMessage,
} from './helper/parse-error-info';
import { fixImageMessage } from './fix-message/fix-image-message';

type PullStatus = SdkPullingStatusEvent['data']['pullingStatus'];
const statusToForceUpdateFinish: PullStatus[] = ['success', 'error', 'timeout'];
const statusToReportError: PullStatus[] = ['error', 'timeout'];

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function -- message
export const listenMessageUpdate = (param: {
  chatCore: ChatCore;
  /**
   * All methods will be reported to slardar.
   */
  reporter: Reporter;
  useMessagesStore: MessagesStore;
  useWaitingStore: WaitingStore;
  useSuggestionsStore: SuggestionsStore;
  useSectionIdStore: SectionIdStore;
  eventCallback: ChatAreaEventCallback;
  securityStrategyContext: SecurityStrategyContext;
  configs: ChatAreaConfigs;
  lifeCycleService: SystemLifeCycleService;
}) => {
  const {
    chatCore,
    reporter,
    useMessagesStore,
    useWaitingStore,
    useSuggestionsStore,
    useSectionIdStore,
    securityStrategyContext,
    eventCallback: { onMessageSuccess, onReceiveMessage, onMessageError },
    configs,
    lifeCycleService,
  } = param;
  localLog({ message: 'listenMessageUpdate' });
  const { updateResponding, updateWaiting, clearUnsettledByReplyId } =
    useWaitingStore.getState();
  /**
   * Note: The main link receiving messages should not be asynchronous
   * onMessageStatusChange are synchronous, so asynchronization when onMessageUpdate may cause problems with both timing
   */
  const onMessageUpdate = ({ data }: SdkMessageEvent) => {
    const { latestSectionId, setLatestSectionId } =
      useSectionIdStore.getState();

    for (const message of data) {
      lifeCycleService.message.onBeforeReceiveMessage({
        ctx: {
          message,
        },
      });
      // onBeforeReceiveMessage
      if (!getShouldDropMessage(configs.ignoreMessageConfigList, message)) {
        if (latestSectionId !== message.section_id) {
          setLatestSectionId(message.section_id);
        }
        onReceiveMessage?.({ message });

        const { message: processedMessage } =
          lifeCycleService.message.onBeforeProcessReceiveMessage({
            ctx: {
              message,
            },
          });

        updateResponding(processedMessage);

        if (getIsSuggestion(processedMessage)) {
          handleSuggestionMessage(processedMessage, useSuggestionsStore);
        } else {
          handleNormalMessage(processedMessage, useMessagesStore, reporter);
        }
        /**
         * The order is reversed with handleXXXMessage here, in order to ensure that the waiting time obtained by the outside is accurate.
         * There shouldn't be any big problems here. You need to pay attention when you have strong dependence here in the future.
         */
        updateWaiting(processedMessage);

        lifeCycleService.message.onAfterProcessReceiveMessage({
          ctx: {
            message,
          },
        });
      }
      securityStrategyContext
        .setStrategy(clearUserMessageAndContextStrategy)
        .executeStrategy(message);
    }
  };

  const onMessageStatusChange = ({
    data,
    abort,
    error,
  }: SdkPullingStatusEvent) => {
    const status = data.pullingStatus;

    if (status === 'error') {
      const ctx = {
        replyId: data.reply_id,
        localMessageId: data.local_message_id,
        error,
      };
      onMessageError?.(ctx);
      lifeCycleService.message.onMessagePullingError({
        ctx,
      });

      const errorInfo = parseErrorInfoFromErrorMessage(error?.message);

      if (
        errorInfo?.code &&
        errorInfo.code === ChatBusinessErrorCode.SuggestError
      ) {
        useSuggestionsStore
          .getState()
          .setGenerateSuggestionError(data.reply_id);
        return;
      }

      if (
        errorInfo?.code &&
        [
          CozeTokenInsufficient.COZE_TOKEN_INSUFFICIENT,
          CozeTokenInsufficient.COZE_TOKEN_INSUFFICIENT_WORKFLOW,
        ].includes(errorInfo.code)
      ) {
        emitAPIErrorEvent(APIErrorEvent.COZE_TOKEN_INSUFFICIENT);
        return;
      }

      if (errorInfo && isToastErrorMessage(errorInfo.code)) {
        Toast.error({ content: errorInfo?.msg, showClose: false });
      }
    }

    if (status === 'success') {
      const ctx = {
        localMessageId: data.local_message_id,
        replyId: data.reply_id,
      };
      onMessageSuccess?.(ctx);
      lifeCycleService.message.onMessagePullingSuccess({
        ctx,
      });
    }

    if (statusToForceUpdateFinish.includes(status)) {
      forceUpdateMessageFinishByData({ data, reporter, useMessagesStore });
      clearUnsettledByReplyId(data.reply_id);
      securityStrategyContext
        .setStrategy(updateStoreSectionIdStrategy)
        .executeStrategy({
          reply_id: data.reply_id,
          extra_info: {},
        });
    }

    if (statusToReportError.includes(status)) {
      // TODO
      // reporter.errorEvent({
      //   eventName: ReportEventNames.PullMessageException,
      //   ...getReportError(data),
      // });
    }

    // Shit, I need to adjust it manually
    // Talk about hiding
    if (status === 'timeout') {
      abort?.();
    }
  };

  const abort = lifeCycleService.app.onBeforeListenChatCore?.({
    onMessageStatusChange,
    onMessageUpdate,
  });
  if (abort) {
    return () => undefined;
  }

  chatCore.on(ChatCore.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, onMessageUpdate);
  chatCore.on(ChatCore.EVENTS.MESSAGE_PULLING_STATUS, onMessageStatusChange);
  const off = () => {
    chatCore.off(ChatCore.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, onMessageUpdate);
    chatCore.off(ChatCore.EVENTS.MESSAGE_PULLING_STATUS, onMessageStatusChange);
  };
  return off;
};

/**
 * For the scenario of error and timeout, it needs to be further marked with the view in the future. For now, it is simply marked as complete.
 */
const forceUpdateMessageFinishByData = (param: {
  data: SdkPullingStatusEvent['data'];
  /**
   * All methods will be reported to slardar.
   */
  reporter: Reporter;
  useMessagesStore: MessagesStore;
}) => {
  const { data, useMessagesStore } = param;

  const { messages: allMessages, updateMessage } = useMessagesStore.getState();
  const replyId = data.reply_id;
  const targetMessages = findMessagesByReplyId(allMessages, replyId);
  if (!targetMessages.length) {
    return;
  }

  // Modification method: Add new private properties to the message, such as _broken, and add scene-based configuration, differentiate in the display logic to replace deletion
  const updateMessageToFinish = getUpdateMessageToFinish(updateMessage);
  targetMessages.forEach(updateMessageToFinish);
};

const handleSuggestionMessage = (
  message: Message,
  useSuggestionsStore: SuggestionsStore,
) => {
  const { updateSuggestion } = useSuggestionsStore.getState();
  updateSuggestion(message.reply_id, message.content);
};

const handleNormalMessage = (
  message: Message,
  useMessageStore: MessagesStore,
  reporter: Reporter,
) => {
  const { updateMessage, hasMessage, addMessage } = useMessageStore.getState();
  // There are problems with downstream dependencies, and it is not easy to modify this time, so cooperate with the server level to smooth the structure at the front end
  const fixedMessage = fixImageMessage(message, reporter);

  if (hasMessage(fixedMessage)) {
    updateMessage(fixedMessage);
  } else {
    addMessage(fixedMessage);
  }
};

type MessageUpdater = (message: Message) => void;

const getUpdateMessageToFinish =
  (updateMessage: MessageUpdater) => (message: Message) => {
    if (message.is_finish) {
      return;
    }

    const newMessage: Message = {
      ...message,
      is_finish: true,
    };
    updateMessage(newMessage);
  };
