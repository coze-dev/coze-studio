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

import { createContext, type PropsWithChildren, type FC, useRef } from 'react';

import { type StoreApi, type UseBoundStore } from 'zustand';

interface StoreRef {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  knowledge?: UseBoundStore<StoreApi<any>> | undefined;
}

export const KnowledgeUploadStoreContext = createContext<{
  storeRef: StoreRef;
}>({
  storeRef: {
    knowledge: undefined,
  },
});

export const KnowledgeUploadStoreProvider: FC<
  PropsWithChildren<{
    createStore: () => StoreRef['knowledge'];
  }>
> = ({ createStore, children }) => {
  const store = useRef<StoreRef>({});

  if (!store.current?.knowledge) {
    store.current.knowledge = createStore();
  }

  return (
    <KnowledgeUploadStoreContext.Provider value={{ storeRef: store.current }}>
      {children}
    </KnowledgeUploadStoreContext.Provider>
  );
};
