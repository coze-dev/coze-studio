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

import { useShallow } from 'zustand/react/shallow';
import { type UiKitChatInputButtonStatus } from '@coze-common/chat-uikit-shared';

import { useMessagesOverview } from '../public/use-messages-overview';
import { useCouldSendNewMessage } from '../messages/use-stop-responding';
import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { usePreference } from '../../context/preference';

export const useBuiltinButtonStatus = ({
  isClearContextButtonDisabled: isClearContextButtonDisabledFromParams,
  isMoreButtonDisabled: isMoreButtonDisabledFromParams,
}: Partial<UiKitChatInputButtonStatus>) => {
  const { useMessagesStore, useWaitingStore, useBatchFileUploadStore } =
    useChatAreaStoreSet();
  const isSendingMessage = useWaitingStore(state => Boolean(state.sending));
  const couldSendMessage = useCouldSendNewMessage();
  const isSendButtonDisabled = !couldSendMessage;
  const filesLength = useBatchFileUploadStore(state => state.fileIdList.length);
  const { fileLimit } = usePreference();
  const { latestSectionHasMessage } = useMessagesOverview();

  const { hasMessage } = useMessagesStore(
    useShallow(state => ({
      hasMessage: Boolean(state.messages.length),
    })),
  );

  return {
    isSendButtonDisabled,
    isMoreButtonDisabled:
      isSendButtonDisabled ||
      filesLength >= fileLimit ||
      isMoreButtonDisabledFromParams,
    isClearHistoryButtonDisabled: !hasMessage || isSendingMessage,
    isClearContextButtonDisabled:
      !hasMessage ||
      isSendingMessage ||
      !latestSectionHasMessage ||
      isClearContextButtonDisabledFromParams,
  };
};
