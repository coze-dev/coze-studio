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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { type StoreApi, type UseBoundStore } from 'zustand';
import type { Diff } from 'deep-diff';

/**
 * stabilization delay time
 * @readonly
 * @enum {number}
 */
export enum DebounceTime {
  /** For saving operations that require an immediate response, such as buttons or drop-down selections  */
  Immediate = 0,
  /** For saving operations that require a short response time, such as dragging and dropping */
  Medium = 500,
  /** Suitable for operations such as text input */
  Long = 1000,
}

/** Functional form when the trigger configuration is declared, used to specify when the field will trigger at runtime */
export type FunctionDebounceTime = () => DebounceTime;

/** The array form when the trigger configuration is declared, which is used to specify the trigger timing when the array content changes */
export interface ArrayDebounceTime {
  arrayType: boolean;
  action:
    | DebounceTime
    | {
        N?: DebounceTime;
        D?: DebounceTime;
        E?: DebounceTime;
      };
}

/** The object form when the trigger configuration declaration is used to specify the triggering time of multiple fields separately */
export interface ObjectDebounceTime {
  default: DebounceTime;
  [index: string]: DebounceTime | ArrayDebounceTime;
}

export type DebounceConfig =
  | DebounceTime
  | ObjectDebounceTime
  | FunctionDebounceTime;

export type FlexibleState<T> = T | any;

export type HostedObserverConfig<StoreType, ScopeKey, ScopeStateType> = Omit<
  AutosaveObserverConfig<StoreType, ScopeKey, ScopeStateType>,
  'saveRequest' | 'eventCallBacks' | 'unobserver' | 'immediate'
>;

export type AutosaveObserverProps<StoreType, ScopeKey, ScopeStateType> =
  AutosaveObserverConfig<StoreType, ScopeKey, ScopeStateType> & {
    store: UseBoundStore<StoreApi<StoreType>>;
  };

export type SelectorType<StoreType, ScopeStateType> =
  | ((store: StoreType) => ScopeStateType)
  | {
      deps: ((store: StoreType) => ScopeStateType)[];
      transformer: (...args: ScopeStateType[]) => FlexibleState<ScopeStateType>;
    };

export interface AutosaveObserverConfig<StoreType, ScopeKey, ScopeStateType> {
  /** The type of data field being hosted */
  key: ScopeKey;
  /** stabilization delay time */
  debounce?: DebounceConfig;
  /** Store property selectors that need to be listened to, support configuration dependencies */
  selector: SelectorType<StoreType, ScopeStateType>;
  /** Middleware, which supports business chain processing of monitoring data */
  middleware?: MiddlewareHanderMap<ScopeStateType>;
  /** Whether to save the current field immediately */
  immediate?: boolean;
  /** saved request */
  saveRequest: SaveRequest<ScopeStateType, ScopeKey>;
  /** Callbacks when hosted data is unsubscribed */
  unobserver?: () => void;
  /** Life Cycle */
  eventCallBacks?: EventCallBacks<ScopeStateType, ScopeKey>;
}

export type SaveRequest<ScopeStateType, ScopeKey> = (
  payload: FlexibleState<ScopeStateType>,
  key: ScopeKey,
  diff: Diff<ScopeStateType, ScopeStateType>[],
) => Promise<FlexibleState<ScopeStateType>>;

export type SaveMiddlewareHander<ScopeStateType> = (
  data: FlexibleState<ScopeStateType>,
) => Promise<FlexibleState<ScopeStateType>> | FlexibleState<ScopeStateType>;

export interface MiddlewareHanderMap<ScopeStateType> {
  /** Lifecycle - After detecting changes */
  onBeforeSave?: SaveMiddlewareHander<ScopeStateType>;
  /** Lifecycle - after successful saving */
  onAfterSave?: SaveMiddlewareHander<ScopeStateType>;
}

export interface EventCallBacks<ScopeStateType, ScopeKey> {
  /** Lifecycle - After detecting changes */
  onBeforeSave?: (params: {
    data: FlexibleState<ScopeStateType>;
    key: ScopeKey;
  }) => void | Promise<void>;
  /** Lifecycle - after successful saving */
  onAfterSave?: (params: {
    data: FlexibleState<ScopeStateType>;
    key: ScopeKey;
  }) => void | Promise<void>;
  /** Life Cycle - Abnormal */
  onError?: (params: { error: Error; key: ScopeKey }) => void;
}

// The path of the changed key compared, corresponding to the array in the form of number
export type PathType = string | number;

export interface UseStoreType<StoreType, ScopeStateType> {
  subscribe: {
    (
      listener: (
        selectedState: ScopeStateType,
        previousSelectedState: ScopeStateType,
      ) => void,
    ): () => void;
    <U>(
      selector: (state: StoreType) => U,
      listener: (selectedState: U, previousSelectedState: U) => void,
      options?: {
        equalityFn?: (a: U, b: U) => boolean;
        fireImmediately?: boolean;
      },
    ): () => void;
  };
}
