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

/* eslint-disable @typescript-eslint/naming-convention */
import { unstable_batchedUpdates } from 'react-dom';

import type { Draft } from 'immer';
import { enableMapSet, produce } from 'immer';

export type Disposer = () => void;

export interface IExternalStore<T> {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => T;
}

export abstract class ExternalStore<T> implements IExternalStore<T> {
  constructor() {
    enableMapSet();
  }

  private _listeners: Set<() => void> = new Set();

  protected abstract _state: T;

  protected _produce = (recipe: (draft: Draft<T>) => void): void => {
    const newState = produce(this._state, recipe);
    if (newState !== this._state) {
      this._state = newState;
      this._dispatch();
    }
  };

  private _dispatch = (): void => {
    if (!this._listeners.size) {
      return;
    }
    unstable_batchedUpdates(() => {
      this._listeners.forEach(listener => listener());
    });
  };

  subscribe = (onStoreChange: () => void): Disposer => {
    this._listeners.add(onStoreChange);
    return () => {
      this._listeners.delete(onStoreChange);
    };
  };

  getSnapshot = (): T => this._state;
}
