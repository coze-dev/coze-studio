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
