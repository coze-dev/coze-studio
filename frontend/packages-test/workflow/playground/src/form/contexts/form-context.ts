/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

export interface FormContextType {
  /**
   * 当设置为 true 时，表单字段应处于只读状态
   */
  readonly?: boolean;
}

export const FormContext = createContext<FormContextType | undefined>(
  undefined,
);

export const FormProvider = FormContext.Provider;

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
