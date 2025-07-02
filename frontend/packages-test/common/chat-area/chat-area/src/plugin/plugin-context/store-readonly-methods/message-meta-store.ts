import { type MessageMetaStore } from '../../../store/message-meta';

export const getMessageMetaStoreReadonlyMethods = (
  useMessageMetaStore: MessageMetaStore,
) => {
  const { getMetaByMessage } = useMessageMetaStore.getState();
  return {
    getMetaByMessage,
  };
};
