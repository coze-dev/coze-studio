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
 * 防抖延迟时间
 * @readonly
 * @enum {number}
 */
export enum DebounceTime {
  /** 用于需要立即响应的保存操作，如按钮或下拉选择等操作  */
  Immediate = 0,
  /** 用于需要较短时间响应的保存操作，如拖拽等操作 */
  Medium = 500,
  /** 适合于文本输入等操作 */
  Long = 1000,
}

/** trigger 配置声明时的函数形式，用于在运行时指定字段触发时机 */
export type FunctionDebounceTime = () => DebounceTime;

/** trigger 配置声明时的数组形式，用于分别指定数组内容变化时的触发时机 */
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

/** trigger 配置声明时的对象形式，用于分别指定多字段触发时机 */
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
  /** 被托管的数据字段的类型 */
  key: ScopeKey;
  /** 防抖延迟时间 */
  debounce?: DebounceConfig;
  /** store 需要被监听的属性选择器，支持配置依赖 */
  selector: SelectorType<StoreType, ScopeStateType>;
  /** 中间件 支持业务链式处理监听数据 */
  middleware?: MiddlewareHanderMap<ScopeStateType>;
  /** 是否立即保存当前字段 */
  immediate?: boolean;
  /** 保存的请求 */
  saveRequest: SaveRequest<ScopeStateType, ScopeKey>;
  /** 被托管的数据取消订阅时进行的回调 */
  unobserver?: () => void;
  /** 生命周期 */
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
  /** 生命周期-检测变更后 */
  onBeforeSave?: SaveMiddlewareHander<ScopeStateType>;
  /** 生命周期-成功保存后 */
  onAfterSave?: SaveMiddlewareHander<ScopeStateType>;
}

export interface EventCallBacks<ScopeStateType, ScopeKey> {
  /** 生命周期-检测变更后 */
  onBeforeSave?: (params: {
    data: FlexibleState<ScopeStateType>;
    key: ScopeKey;
  }) => void | Promise<void>;
  /** 生命周期-成功保存后 */
  onAfterSave?: (params: {
    data: FlexibleState<ScopeStateType>;
    key: ScopeKey;
  }) => void | Promise<void>;
  /** 生命周期-异常 */
  onError?: (params: { error: Error; key: ScopeKey }) => void;
}

// 比对出来的被变化的 key 的 path， number 形式对应数组
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
