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

import { isError, merge } from 'lodash-es';
import websocketManager from '@coze-common/websocket-manager-adapter';
import {
  type ContentType,
  type ChatCore,
  type SendMessageOptions,
  ApiError,
} from '@coze-common/chat-core';
import { APIErrorEvent, emitAPIErrorEvent } from '@coze-arch/bot-http';
import { Toast } from '@coze-arch/coze-design';

import { getStopRespondingImplement } from '../use-stop-responding';
import { useMethodCommonDeps } from '../../context/use-method-common-deps';
import { proxyFreeze } from '../../../utils/proxy-freeze';
import { getMessageUniqueKey } from '../../../utils/message';
import {
  builtinASRProcess,
  removeAudioFileAfterSendMessage,
  revertVoiceMessageConditionally,
} from '../../../utils/builtin-asr-process';
import { buildInProcessSentMessage } from '../../../utils/build-in-process-sent-message';
import type {
  FileMessage,
  ImageMessage,
  Message,
  MultimodalMessage,
  NormalizedFileMessage,
  TextMessage,
} from '../../../store/types';
import { type UpdateMessage } from '../../../store/messages';
import { type FileAction } from '../../../store/file';
import {
  CozeTokenInsufficient,
  isChatCoreError,
  parseErrorInfoFromErrorMessage,
  isToastErrorMessage,
} from '../../../service/helper/parse-error-info';
import { getReportError, ReportEventNames } from '../../../report-events';
import { type MethodCommonDeps } from '../../../plugin/types';
import type { SendMessageFrom } from '../../../context/chat-area-context/chat-area-callback';

export const useSendMessageAndAutoUpdate = () => {
  const deps = useMethodCommonDeps();
  return getSendMessageAndAutoUpdateImplement(deps);
};

const getSendMessageAndAutoUpdateImplement =
  (deps: MethodCommonDeps) =>
  async (
    sendMessageParams: {
      message: Message;
      options?: SendMessageOptions;
    },
    from: SendMessageFrom,
  ) => {
    const stopResponding = getStopRespondingImplement(deps);
    const {
      storeSet,
      context: { eventCallback, lifeCycleService, reporter },
    } = deps;
    const {
      useGlobalInitStore,
      useMessagesStore,
      useWaitingStore,
      useSectionIdStore,
    } = storeSet;
    const { chatCore } = useGlobalInitStore.getState();
    const { updateMessage } = useMessagesStore.getState();
    const { latestSectionId, setLatestSectionId } =
      useSectionIdStore.getState();
    const { startWaiting, startSending, clearSending } =
      useWaitingStore.getState();
    const { message: toSenDMessage, options } = sendMessageParams;
    const stopRespondingPromise = stopResponding();

    const defaultSendMessageOptions = {
      extendFiled: {
        device_id: String(websocketManager.deviceId),
      },
    };

    const mergedOptions = merge({}, defaultSendMessageOptions, options);

    if (!chatCore) {
      throw new Error('chatCore is not ready');
    }

    const sendingMessage: Message = {
      ...toSenDMessage,
      is_finish: false,
    };
    delete sendingMessage._sendFailed;
    updateMessage(sendingMessage);

    startSending(sendingMessage);

    try {
      await stopRespondingPromise;
      // TODO: A rough implementation that needs to be used temporarily, and needs to be implemented in the future
      const handledMessageAndOptions = eventCallback?.onBeforeMessageSend?.(
        {
          message: proxyFreeze(toSenDMessage),
          options: proxyFreeze(mergedOptions),
        },
        from,
      );

      const { message: processedMessage, options: processedOptions } =
        await lifeCycleService.message.onBeforeSendMessage({
          ctx: {
            message: handledMessageAndOptions?.message ?? toSenDMessage,
            options: handledMessageAndOptions?.options ?? mergedOptions,
            from,
          },
        });

      updateMessage(processedMessage);

      const sentMessage = await chatCore.sendMessage(
        processedMessage,
        processedOptions,
      );

      if (sentMessage.section_id !== latestSectionId) {
        setLatestSectionId(sentMessage.section_id);
      }

      reporter.successEvent({ eventName: ReportEventNames.SendMessage });
      buildInProcessSentMessage(sentMessage, {
        useMessagesStore,
      });
      eventCallback?.onMessageSendSuccess?.({ message: sentMessage }, from);
      await lifeCycleService.message.onAfterSendMessage({
        ctx: {
          message: sentMessage,
          from,
        },
      });
      startWaiting(sentMessage);
      updateMessage(toSenDMessage, sentMessage);
    } catch (e) {
      reporter.errorEvent({
        eventName: ReportEventNames.SendMessage,
        ...getReportError(e),
      });
      const failMessage: Message = {
        ...toSenDMessage,
        _sendFailed: true,
        is_finish: true,
      };
      updateMessage(failMessage);
      eventCallback?.onMessageSendFail?.({ message: toSenDMessage }, from, e);

      await lifeCycleService.message.onSendMessageError({
        ctx: {
          message: failMessage,
          from,
          error: e,
        },
      });

      if (isError(e)) {
        const errorData = parseErrorInfoFromErrorMessage(e.message);
        /**
         * No error entering sse.
         * The server level is still combing the error message, and can only toast the messages that have been combed in the whitelist.
         */
        if (isChatCoreError(e) && isToastErrorMessage(e.ext.code)) {
          Toast.error({ content: e.message, showClose: false });
        }
        // Enter the sse process but the first chunk is an error
        if (
          errorData?.code &&
          [
            CozeTokenInsufficient.COZE_TOKEN_INSUFFICIENT,
            CozeTokenInsufficient.COZE_TOKEN_INSUFFICIENT_WORKFLOW,
          ].includes(errorData?.code)
        ) {
          emitAPIErrorEvent(APIErrorEvent.COZE_TOKEN_INSUFFICIENT);
        }
      }
    } finally {
      clearSending();
    }
  };

export const useSendNewMessage = () => {
  const deps = useMethodCommonDeps();
  return getSendNewMessageImplement(deps);
};

const processASRConditionally = async (
  message: Message<ContentType>,
  {
    getAudioFileByLocalId,
    chatCore,
    updateMessage,
    removeAudioFileByLocalId,
    updateAudioProcessState,
  }: {
    chatCore: ChatCore | null;
    updateMessage: UpdateMessage;
    getAudioFileByLocalId: FileAction['getAudioFileByLocalId'];
    removeAudioFileByLocalId: FileAction['removeAudioFileByLocalId'];
    updateAudioProcessState: FileAction['updateAudioProcessState'];
  },
) => {
  const localMessageId = message.extra_info.local_message_id;
  const audioFile = getAudioFileByLocalId(localMessageId);
  if (!audioFile) {
    return message;
  }

  if (message.message_id) {
    return message;
  }

  updateAudioProcessState({ localMessageId, state: 'processing' });
  const processedMessage = await builtinASRProcess(message, {
    chatCore,
    audioFile,
  });

  if (!processedMessage) {
    return;
  }

  updateMessage(processedMessage);

  return processedMessage;
};

export const getSendNewMessageImplement =
  (deps: MethodCommonDeps) =>
  async (
    unsentMessage:
      | TextMessage
      | FileMessage
      | ImageMessage
      | MultimodalMessage
      | NormalizedFileMessage,
    from: SendMessageFrom,
    options?: SendMessageOptions,
  ) => {
    const {
      context: { lifeCycleService, reporter },
      services: { chatActionLockService, loadMoreClient },
      storeSet: { useMessagesStore, useGlobalInitStore, useFileStore },
    } = deps;
    if (chatActionLockService.globalAction.getIsLock('sendMessageToACK')) {
      return 'LOCKED';
    }
    const { addMessage, updateMessage, deleteMessageByIdStruct } =
      useMessagesStore.getState();
    const {
      getAudioFileByLocalId,
      removeAudioFileByLocalId,
      updateAudioProcessState,
      getAudioProcessStateByLocalId,
    } = useFileStore.getState();
    const { chatCore } = useGlobalInitStore.getState();

    const sendMessage = getSendMessageAndAutoUpdateImplement(deps);
    try {
      chatActionLockService.globalAction.lock('sendMessageToACK', {
        messageUniqKey: getMessageUniqueKey(unsentMessage),
      });

      await loadMoreClient.loadEagerly();
      const { message: processedMessage } =
        await lifeCycleService.message.onBeforeAppendSenderMessageIntoStore({
          ctx: {
            message: unsentMessage,
            from,
          },
        });

      addMessage(processedMessage);

      const preReadySendMessage = await processASRConditionally(
        processedMessage,
        {
          chatCore,
          updateMessage,
          getAudioFileByLocalId,
          removeAudioFileByLocalId,
          updateAudioProcessState,
        },
      );

      // The ASR process is abnormal, delete the screen message, and exit.
      if (!preReadySendMessage) {
        revertVoiceMessageConditionally({
          message: processedMessage,
          getAudioProcessStateByLocalId,
          deleteMessageByIdStruct,
        });
        return 'VOICE_NOT_RECOGNIZE';
      }

      await lifeCycleService.message.onAfterAppendSenderMessageIntoStore({
        ctx: {
          message: preReadySendMessage,
          from,
        },
      });

      await sendMessage(
        { message: preReadySendMessage, options },
        from || 'inputAndSend',
      );
    } catch (error) {
      const res = revertVoiceMessageConditionally({
        message: unsentMessage,
        getAudioProcessStateByLocalId,
        deleteMessageByIdStruct,
      });

      if (res === 'reverted') {
        if (error instanceof ApiError) {
          if (
            error.code ===
            String(CozeTokenInsufficient.COZE_TOKEN_INSUFFICIENT_VOICE)
          ) {
            return 'TOKEN_INSUFFICIENT_VOICE';
          }
          if (
            error.code ===
            String(CozeTokenInsufficient.COZE_PRO_TOKEN_INSUFFICIENT_VOICE)
          ) {
            return 'PRO_TOKEN_INSUFFICIENT_VOICE';
          }
        }
        return 'VOICE_NOT_RECOGNIZE';
      }

      const customError: Error =
        error instanceof Error
          ? error
          : new Error('use SendNewMessage has some error');

      reporter.error({
        error: customError,
        message: 'useSendNewMessage has some error',
      });
    } finally {
      removeAudioFileAfterSendMessage({
        message: unsentMessage,
        removeAudioFileByLocalId,
        updateAudioProcessState,
      });
      chatActionLockService.globalAction.unlock('sendMessageToACK');
    }
  };
