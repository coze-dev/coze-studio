import { type MessageIndexStore } from '../../../store/message-index';

export const getMessageIndexStoreWriteableMethods = (
  useMessageIndexStore: MessageIndexStore,
) => {
  const { updateIgnoreIndexAndHistoryMessages } =
    useMessageIndexStore.getState();
  return {
    updateIgnoreIndexAndHistoryMessages,
  };
};
