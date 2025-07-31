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

import { merge } from 'lodash-es';

export interface IPreferenceContext {
  /**
   * Whether to enable Tool Hide Mode
   */
  enableToolHiddenMode: boolean;
  /**
   * Read-only status
   */
  isReadonly: boolean;
}

const DEFAULT_PREFERENCE: IPreferenceContext = {
  enableToolHiddenMode: false,
  isReadonly: false,
};

const PreferenceContext = createContext<IPreferenceContext>(DEFAULT_PREFERENCE);

export const PreferenceContextProvider: FC<
  PropsWithChildren<Partial<IPreferenceContext>>
> = props => {
  const { children, ...rest } = props;

  return (
    <PreferenceContext.Provider value={merge({}, DEFAULT_PREFERENCE, rest)}>
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreference = () => useContext(PreferenceContext);
