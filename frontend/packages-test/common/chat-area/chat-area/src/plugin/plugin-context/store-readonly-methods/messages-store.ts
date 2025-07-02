import { type MessagesStore } from '../../../store/messages';

export const getMessagesStoreReadonlyMethods = (
  useMessagesStore: MessagesStore,
) => {
  const {
    getMessageGroupById,
    getMessageGroupByUserMessageId,
    getMessageIndexRange,
    findMessage,
  } = useMessagesStore.getState();
  return {
    getMessageGroupById,
    getMessageGroupByUserMessageId,
    getMessageIndexRange,
    findMessage,
  };
};
