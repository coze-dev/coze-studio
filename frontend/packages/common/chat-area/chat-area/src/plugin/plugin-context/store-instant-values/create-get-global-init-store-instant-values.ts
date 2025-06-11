import { type GlobalInitStore } from '../../../store/global-init';

export const createGetGlobalInitStoreInstantValues =
  (useGlobalInitStore: GlobalInitStore) => () => {
    const { initStatus } = useGlobalInitStore.getState();
    return {
      initStatus,
    };
  };
