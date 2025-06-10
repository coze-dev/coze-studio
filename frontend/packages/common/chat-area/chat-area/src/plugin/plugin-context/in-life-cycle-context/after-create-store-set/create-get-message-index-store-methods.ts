/* eslint-disable @coze-arch/no-deep-relative-import */
import { type MessageIndexStore } from '../../../../store/message-index';

export const getMessageIndexStoreMethods = (
  useMessageIndexStore: MessageIndexStore,
) => {
  const { updateIgnoreIndexAndHistoryMessages } =
    useMessageIndexStore.getState();
  return {
    updateIgnoreIndexAndHistoryMessages,
  };
};
