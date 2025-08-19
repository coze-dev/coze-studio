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

import { type ReactNode, createContext, type FC, useContext } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { type ClientStateAction, type ClientStore } from './global';

export const GlobalStoreContext = createContext<{
  globalStore: ClientStore;
  // @ts-expect-error -- linter-disable-autofix
}>(undefined);

export const GlobalStoreProvider: FC<{
  children: ReactNode;
  globalStore: ClientStore;
}> = ({ children, globalStore }) => (
  <GlobalStoreContext.Provider
    value={{
      globalStore,
    }}
  >
    {children}
  </GlobalStoreContext.Provider>
);

export const useGlobalStore: <T>(
  selector: (store: ClientStateAction) => T,
) => T = selector => {
  const store = useContext(GlobalStoreContext).globalStore;
  return useStoreWithEqualityFn(store, selector, shallow);
};
