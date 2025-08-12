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

import React, { createContext, useContext, useMemo } from 'react';

import {
  createStore,
  type StoreContext,
  type IDEGlobalState,
  type IDEGlobalAction,
} from './create-store';

const IDEGlobalContext = createContext<StoreContext>(null as any);

type IDEGlobalProviderProps = React.PropsWithChildren<{
  spaceId: string;
  projectId: string;
  version: string;
}>;

export const IDEGlobalProvider: React.FC<IDEGlobalProviderProps> = ({
  spaceId,
  projectId,
  version,
  children,
}) => {
  const store = useMemo(
    () => createStore({ spaceId, projectId, version }),
    [spaceId, projectId, version],
  );

  return (
    <IDEGlobalContext.Provider value={store}>
      {children}
    </IDEGlobalContext.Provider>
  );
};

export const useIDEGlobalContext = () => useContext(IDEGlobalContext);

export const useIDEGlobalStore = <T,>(
  selector: (s: IDEGlobalState & IDEGlobalAction) => T,
) => {
  const store = useIDEGlobalContext();

  if (!store) {
    throw new Error('cant not found IDEGlobalContext');
  }

  return store(selector);
};
