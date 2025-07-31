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

// eslint-disable-next-line @coze-arch/no-batch-import-or-export, @typescript-eslint/consistent-type-imports
import * as zustand from 'zustand';
import { act } from '@testing-library/react';

const { create: actualCreate, createStore: actualCreateStore } =
  await vi.importActual<typeof zustand>('zustand');

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
  console.log('zustand create mock');

  // to support curried version of create
  return typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried;
}) as typeof zustand.create;

const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const createStore = (<T>(stateCreator: zustand.StateCreator<T>) => {
  console.log('zustand createStore mock');

  // to support curried version of createStore
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
}) as typeof zustand.createStore;

// reset all stores after each test run
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => {
      resetFn();
    });
  });
});
