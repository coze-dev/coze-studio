import { createContext, useContext } from 'react';

import {
  type ReadLocalStoreValue,
  type WriteLocalStoreValue,
} from '../../utils/local-cache';

interface LocalCacheContext {
  readLocalStoreValue: ReadLocalStoreValue;
  writeLocalStoreValue: WriteLocalStoreValue;
}

export const LocalCacheContext = createContext<LocalCacheContext>({
  readLocalStoreValue: () => {
    throw new Error('unimplemented readLocalStoreValue');
  },
  writeLocalStoreValue: () => {
    throw new Error('unimplemented writeLocalStoreValue');
  },
});

export const useLocalCache = () => useContext(LocalCacheContext);
