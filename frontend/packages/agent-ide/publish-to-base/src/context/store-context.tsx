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
