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

import { createContext, useContext, useRef } from 'react';

import {
  createWithEqualityFn,
  type UseBoundStoreWithEqualityFn,
} from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type StoreApi } from 'zustand';

import { type IFormSchema } from '../form-engine';

/**
 * Global nature state centralized management within a single form
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
