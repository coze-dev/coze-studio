import { useState } from 'react';

import type { LocalCacheKey, StoreStruct } from '../utils/local-cache/type';
import { useLocalCache } from '../context/local-cache';

export const useStateWithLocalCache = <K extends LocalCacheKey>(
  key: K,
  init: StoreStruct[K],
) => {
  const { readLocalStoreValue, writeLocalStoreValue } = useLocalCache();
  const readVal = readLocalStoreValue(key, init);
  const [state, setState] = useState(readVal);
  return {
    state,
    setState: (val: StoreStruct[K]) => {
      setState(val);
      writeLocalStoreValue(key, val);
    },
  };
};
