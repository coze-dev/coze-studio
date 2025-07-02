import { type MessagesStore } from '../../../store/messages';

export const getMessagesStoreWriteableMethods = (
  useMessagesStore: MessagesStore,
) => {
  const { clearMessage, addMessages, deleteMessageByIdList, updateMessage } =
    useMessagesStore.getState();
  return {
    clearMessage,
    addMessages,
    deleteMessageByIdList,
    updateMessage,
  };
};
