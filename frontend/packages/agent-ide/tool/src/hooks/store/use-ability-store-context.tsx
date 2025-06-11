import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import { noop } from 'lodash-es';

import { type IAbilityStoreState } from '../../typings/store';

interface IAbilityStoreContext {
  state: IAbilityStoreState;
  setState: (state: IAbilityStoreState) => void;
}

const AbilityStoreContext = createContext<IAbilityStoreContext>({
  state: {},
  setState: noop,
});

export const AbilityStoreProvider: FC<
  PropsWithChildren<IAbilityStoreContext>
> = ({ children, state, setState }) => (
  <AbilityStoreContext.Provider
    value={{
      state,
      setState,
    }}
  >
    {children}
  </AbilityStoreContext.Provider>
);

export const useAbilityStoreContext = () => useContext(AbilityStoreContext);
