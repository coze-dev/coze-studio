/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import { type FieldInstance } from '../type';

export const FieldContext = createContext<FieldInstance | undefined>(undefined);

export const FieldProvider = FieldContext.Provider;

export function useFieldContext() {
  const context = useContext(FieldContext);
  if (context === undefined) {
    throw new Error('useFieldContext must be used within a FieldProvider');
  }
  return context;
}
