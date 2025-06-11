import { type MessagesStore } from '../../../store/messages';

export const createGetMessagesStoreInstantValues =
  (useMessagesStore: MessagesStore) => () => {
    const { messages } = useMessagesStore.getState();
    return {
      messages,
    };
  };
