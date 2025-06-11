import { createContext, useContext } from 'react';

import { type FeishuBaseConfigFe } from '../types';
import { type ConfigStore } from '../store';

export const StoreContext = createContext<{
  store?: ConfigStore;
}>({});

export const useConfigStoreRaw = () => useContext(StoreContext).store;

export const useConfigStoreGuarded = () => {
  const store = useConfigStoreRaw();
  if (!store) {
    throw new Error('impossible store unprovided');
  }
  return store;
};

export const useConfigAsserted = (): FeishuBaseConfigFe => {
  const useStore = useConfigStoreGuarded();
  const config = useStore(state => state.config);
  if (!config) {
    throw new Error('cannot get config');
  }
  return config;
};
