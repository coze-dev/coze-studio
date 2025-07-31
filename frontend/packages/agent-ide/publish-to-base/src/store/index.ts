/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
