import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import {
  type AbilityKey,
  type AbilityScope,
} from '@coze-agent-ide/tool-config';

interface IAbilityConfigContext {
  abilityKey?: AbilityKey;
  scope?: AbilityScope;
}

const DEFAULT_ABILITY_CONFIG = {
  abilityKey: undefined,
  scope: undefined,
};

const AbilityConfigContext = createContext<IAbilityConfigContext>(
  DEFAULT_ABILITY_CONFIG,
);

export const AbilityConfigContextProvider: FC<
  PropsWithChildren<IAbilityConfigContext>
> = props => {
  const { children, ...rest } = props;

  return (
    <AbilityConfigContext.Provider value={rest}>
      {children}
    </AbilityConfigContext.Provider>
  );
};

export const useAbilityConfigContext = () => useContext(AbilityConfigContext);
