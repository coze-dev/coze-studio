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
