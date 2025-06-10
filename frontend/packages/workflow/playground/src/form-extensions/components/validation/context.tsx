import React, { createContext } from 'react';

import {
  type ValidationContextProps,
  type ValidationProviderProps,
} from './type';

export const ValidationContext = createContext<
  ValidationContextProps | undefined
>(undefined);

export const ValidationProvider: React.FC<ValidationProviderProps> = ({
  errors,
  children,
  onTestRunValidate,
}) => (
  <ValidationContext.Provider value={{ errors, onTestRunValidate }}>
    {children}
  </ValidationContext.Provider>
);
