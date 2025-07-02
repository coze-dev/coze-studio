import { type MessageMetaStore } from '../../../store/message-meta';

export const createGetMessageMetaStoreInstantValues =
  (useMessageMetaStore: MessageMetaStore) => () => {
    const { metaList } = useMessageMetaStore.getState();
    return {
      metaList,
    };
  };
