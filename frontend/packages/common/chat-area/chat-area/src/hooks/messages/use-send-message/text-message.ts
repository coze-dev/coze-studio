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

import { type SendMessageOptions } from '@coze-common/chat-core';
import { type SendTextMessagePayload } from '@coze-common/chat-uikit-shared';

import { useMethodCommonDeps } from '../../context/use-method-common-deps';
import { toastBySendMessageResult } from '../../../utils/message';
import type { TextMessage } from '../../../store/types';
import { type SendMessagePayload } from '../../../service/send-message';
import { type MethodCommonDeps } from '../../../plugin/types';
import type { SendMessageFrom } from '../../../context/chat-area-context/chat-area-callback';
import { getSendNewMessageImplement } from './new-message';

const getCreateTextMessageImplement =
  (deps: MethodCommonDeps) =>
  (payload: SendTextMessagePayload): TextMessage => {
    const { storeSet } = deps;
    const { useSectionIdStore, useGlobalInitStore } = storeSet;
    const chatCore = useGlobalInitStore.getState().getChatCore();
    const { latestSectionId } = useSectionIdStore.getState();
    return chatCore.createTextMessage(
      {
        payload: {
          text: payload.text,
          mention_list: payload.mentionList,
        },
      },
      {
        section_id: latestSectionId,
      },
    );
  };

/**
 * Send a text message, which needs to be used after successful initialization.
 */
export const useSendTextMessage = () => {
  const deps = useMethodCommonDeps();
  return getSendTextMessageImplement(deps);
};

export const getSendTextMessageImplement =
  (deps: MethodCommonDeps) =>
  async (
    payload: SendMessagePayload,
    from: SendMessageFrom,
    options?: SendMessageOptions,
  ) => {
    const createTextMessage = getCreateTextMessageImplement(deps);
    const sendMessage = getSendNewMessageImplement(deps);
    const unsentMessage = createTextMessage(payload);
    if (payload.audioFile) {
      deps.storeSet.useFileStore.getState().addAudioFile({
        localMessageId: unsentMessage.extra_info.local_message_id,
        audioFile: payload.audioFile,
      });
    }
    const result = await sendMessage(unsentMessage, from, options);
    toastBySendMessageResult(result);
  };
