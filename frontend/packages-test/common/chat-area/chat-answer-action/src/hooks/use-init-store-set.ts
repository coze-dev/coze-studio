import { useCreation } from 'ahooks';

import { createFavoriteBotTriggerConfigStore } from '../store/favorite-bot-trigger-config';
import { type StoreSet } from '../context/store/type';

export const useInitStoreSet = (): StoreSet => {
  const useFavoriteBotTriggerConfigStore = useCreation(
    () => createFavoriteBotTriggerConfigStore(),
    [],
  );
  return { useFavoriteBotTriggerConfigStore };
};
