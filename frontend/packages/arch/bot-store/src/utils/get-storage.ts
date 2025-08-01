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

import { type StateStorage } from 'zustand/middleware';
import { throttle } from 'lodash-es';
import localForage from 'localforage';

const instance = localForage.createInstance({
  name: 'botStudio',
  storeName: 'botStudio',
});

const throttleTime = 1000;

/**
 * Get stored data persistence engine
 */
export const getStorage = (): StateStorage => {
  const persistStorage: StateStorage = {
    getItem: async (name: string) => await instance.getItem(name),
    setItem: throttle(async (name: string, value: unknown): Promise<void> => {
      await instance.setItem(name, value);
    }, throttleTime),
    removeItem: async (name: string) => {
      await instance.removeItem(name);
    },
  };

  return persistStorage;
};

/** @Deprecated - problem with persistence scheme, deprecated */
export const clearStorage = instance.clear;
