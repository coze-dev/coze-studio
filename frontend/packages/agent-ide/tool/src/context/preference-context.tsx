import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import { merge } from 'lodash-es';

export interface IPreferenceContext {
  /**
   * 是否开启Tool隐藏模式
   */
  enableToolHiddenMode: boolean;
  /**
   * 是否只读状态
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
