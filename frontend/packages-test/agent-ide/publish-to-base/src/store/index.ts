import { create } from 'zustand';
import { produce } from 'immer';

import { type FeishuBaseConfigFe } from '../types';

export interface ConfigStoreState {
  config: FeishuBaseConfigFe | null;
}

export interface ConfigStoreAction {
  setConfig: (cfg: FeishuBaseConfigFe) => void;
  updateConfigByImmer: (mutateFn: (cur: FeishuBaseConfigFe) => void) => void;
  clear: () => void;
}

const getDefaultState = (): ConfigStoreState => ({
  config: null,
});

export const createConfigStore = () =>
  create<ConfigStoreState & ConfigStoreAction>((set, get) => ({
    ...getDefaultState(),
    setConfig: cfg => set({ config: cfg }),
    updateConfigByImmer: updater => {
      const { config } = get();
      if (!config) {
        return;
      }
      const newConfig = produce<FeishuBaseConfigFe>(updater)(config);
      set({ config: newConfig });
    },
    clear: () => set(getDefaultState()),
  }));

export type ConfigStore = ReturnType<typeof createConfigStore>;
