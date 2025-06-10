import { type SenderInfoStore } from '../../../store/sender-info';

export const createGetBotInfoStoreReadonlyMethods =
  (useSenderInfoStore: SenderInfoStore) => () => {
    const { getBotInfo, botInfoMap } = useSenderInfoStore.getState();
    return {
      getBotInfo,
      botInfoMap,
    };
  };
