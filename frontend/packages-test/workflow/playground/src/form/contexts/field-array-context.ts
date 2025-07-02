/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import { type FieldArrayInstance } from '../type';

export const FieldArrayContext = createContext<FieldArrayInstance | undefined>(
  undefined,
);

export const FieldArrayProvider = FieldArrayContext.Provider;

export function useFieldArrayContext() {
  const context = useContext(FieldArrayContext);
  if (context === undefined) {
    throw new Error(
      'useFieldArrayContext must be used within a FieldArrayProvider',
    );
  }
  return context;
}
