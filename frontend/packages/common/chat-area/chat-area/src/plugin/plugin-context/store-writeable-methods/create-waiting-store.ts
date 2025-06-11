import { type WaitingStore } from '../../../store/waiting';

export const createGetWaitingStoreWriteableMethods =
  (useWaitingStore: WaitingStore) => () => {
    const {
      updateResponding,
      updateWaiting,
      clearWaitingStore,
      updateRespondingByImmer,
    } = useWaitingStore.getState();
    return {
      updateResponding,
      updateWaiting,
      clearWaitingStore,
      updateRespondingByImmer,
    };
  };
