import { type WaitingStore } from '../../../store/waiting';

export const createGetWaitingStoreInstanceValues =
  (useWaitingStore: WaitingStore) => () => {
    const { waiting, responding, sending } = useWaitingStore.getState();
    return {
      waiting,
      responding,
      sending,
    };
  };
