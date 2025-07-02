import { createContext, useContext } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

export const CodeSetterContext = createContext<
  Partial<Omit<SetterComponentProps, 'value' | 'onChange' | 'options'>> & {
    readonly?: boolean;
  }
>({});

export const useCodeSetterContext = () => useContext(CodeSetterContext);
