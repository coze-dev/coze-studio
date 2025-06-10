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
