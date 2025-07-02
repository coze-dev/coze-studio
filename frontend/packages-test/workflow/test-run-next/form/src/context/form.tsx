import { createContext, useContext, useRef } from 'react';

import {
  createWithEqualityFn,
  type UseBoundStoreWithEqualityFn,
} from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type StoreApi } from 'zustand';

import { type IFormSchema } from '../form-engine';

/**
 * 单一表单内的全局性质状态集中管理
 */
export interface TestRunFormState {
  schema: IFormSchema | null;
  mode: 'form' | 'json';
  patch: (next: Partial<TestRunFormState>) => void;
  getSchema: () => TestRunFormState['schema'];
}

const createStore = () =>
  createWithEqualityFn<TestRunFormState>(
    (set, get) => ({
      schema: null,
      mode: 'form',
      patch: next => set(() => next),
      getSchema: () => get().schema,
    }),
    shallow,
  );

type FormStore = UseBoundStoreWithEqualityFn<StoreApi<TestRunFormState>>;

const FormContext = createContext<FormStore>({} as unknown as FormStore);

export const TestRunFormProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const ref = useRef(createStore());
  return (
    <FormContext.Provider value={ref.current}>{children}</FormContext.Provider>
  );
};

export const useTestRunFormStore = <T,>(
  selector: (s: TestRunFormState) => T,
) => {
  const store = useContext(FormContext);

  return store(selector);
};
