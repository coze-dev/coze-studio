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
