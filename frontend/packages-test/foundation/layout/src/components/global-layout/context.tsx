import { createContext, useContext } from 'react';

import { noop } from 'lodash-es';

import { type GlobalLayoutContext } from './types';

export const globalLayoutContext = createContext<GlobalLayoutContext>({
  sideSheetVisible: false,
  setSideSheetVisible: noop,
});
export const GlobalLayoutProvider = globalLayoutContext.Provider;

export const useGlobalLayoutContext = () => useContext(globalLayoutContext);
