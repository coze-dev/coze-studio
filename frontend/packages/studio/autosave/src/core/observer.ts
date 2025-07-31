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

import { type StoreApi, type UseBoundStore } from 'zustand';
import { createSelector } from 'reselect';
import { debounce, has, get, type DebouncedFunc } from 'lodash-es';
import diff, { type Diff } from 'deep-diff';

import { isFunction, isObject, getPayloadByFormatter } from '../utils';
import {
  DebounceTime,
  type AutosaveObserverConfig,
  type UseStoreType,
  type PathType,
  type AutosaveObserverProps,
} from '../type/index';

export class AutosaveObserver<StoreType, ScopeKey, ScopeStateType> {
  private store: UseBoundStore<StoreApi<StoreType>>;

  public lock: boolean;
  public debouncedSaveFunc: DebouncedFunc<() => Promise<void>>;
  public nextState!: ScopeStateType;
  public prevState!: ScopeStateType;
  private diff!: Diff<ScopeStateType, ScopeStateType>[];

  private unobserver?: () => void;
  private unsubscribe!: () => void;
  public config: AutosaveObserverConfig<StoreType, ScopeKey, ScopeStateType>;

  constructor(
    props: AutosaveObserverProps<StoreType, ScopeKey, ScopeStateType>,
  ) {
    const { store, ...config } = props;
    this.store = store;
    this.lock = false;
    this.config = config;

    // Subscription field initialization
    this.initSubscribe();
  }

  private initSubscribe = () => {
    const memoizeSelector = this.getMemoizeSelector();

    this.unsubscribe = (
      this.store as unknown as UseStoreType<StoreType, ScopeStateType>
    ).subscribe(memoizeSelector, this.subscribeCallback);
  };

  private getMemoizeSelector = () => {
    if (typeof this.config.selector === 'function') {
      return this.config.selector;
    } else {
      // Create a memorable selector with createSelector
      const { deps, transformer } = this.config.selector;
      return createSelector(deps, transformer);
    }
  };

  private subscribeCallback = async (nextState, prevState) => {
    console.log('nextState :>> ', nextState);
    console.log('prevState :>> ', prevState);

    // The state returned by the selector
    this.nextState = nextState;
    this.prevState = prevState;

    if (this.lock) {
      return;
    }

    const diffChange: Diff<ScopeStateType, ScopeStateType>[] | undefined = diff(
      prevState,
      nextState,
    );

    console.log('diffChange:>>', diffChange);
    if (!diffChange) {
      return;
    }
    this.debouncedSaveFunc?.cancel?.();

    this.diff = diffChange;

    const delayTime = this.getTriggerDelayTime(prevState, diffChange);

    console.log('delayTime:>>>>>', delayTime);

    if (delayTime === 0 || this.config.immediate) {
      await this.parsedSaveFunc();
      return;
    }
    this.debouncedSaveFunc = debounce(this.parsedSaveFunc, delayTime);

    await this.debouncedSaveFunc();
  };

  private parsedSaveFunc = async () => {
    // Middleware - Before saving
    const beforeSavePayload = await getPayloadByFormatter<ScopeStateType>(
      this.nextState,
      this.config?.middleware?.onBeforeSave,
    );
    // Life cycle - before saving
    await this.config?.eventCallBacks?.onBeforeSave?.({
      key: this.config.key,
      data: beforeSavePayload,
    });

    console.log('beforeSavePayload:>>', beforeSavePayload);
    try {
      await this.config.saveRequest(
        beforeSavePayload,
        this.config.key,
        this.diff,
      );

      // Middleware - after saving
      const afterSavePayload = await getPayloadByFormatter<ScopeStateType>(
        this.nextState,
        this.config?.middleware?.onAfterSave,
      );
      console.log('afterSavePayload:>>', afterSavePayload);

      // Life cycle - after saving
      await this.config?.eventCallBacks?.onAfterSave?.({
        key: this.config.key,
        data: afterSavePayload,
      });
    } catch (error) {
      console.log('error:>>', error);
      // Life Cycle - Abnormal
      this.config?.eventCallBacks?.onError?.({
        key: this.config.key,
        error: error as Error,
      });
    }
  };

  /**
   * unsubscribe
   */
  public close = () => {
    this.debouncedSaveFunc?.flush();
    this.unsubscribe();
    this.unobserver?.();
  };

  /**
   * Get the trigger delay time caused by the state change
   * @param prevState selector to store content
   * @param diffChange the diff before and after comparison
   * @returns delay time
   */
  private getTriggerDelayTime = (
    prevState?: ScopeStateType,
    diffChange?: Diff<ScopeStateType, ScopeStateType>[],
  ) => {
    const configDebounce = this.config.debounce;

    if (!configDebounce) {
      return DebounceTime.Immediate;
    }

    if (isFunction(configDebounce)) {
      return configDebounce();
    }

    if (!isObject(configDebounce)) {
      return configDebounce;
    }

    if (!diffChange || diffChange.length === 0) {
      return configDebounce.default;
    }

    const targetDelayTimes: number[] = [];
    for (const change of diffChange) {
      const changePath = change.path;
      const debouncePath = this.getdebouncePath(changePath);

      if (
        !changePath ||
        !has(prevState, changePath) ||
        typeof debouncePath === 'number'
      ) {
        targetDelayTimes.push(configDebounce.default);
        continue;
      }
      const debounceType = get(
        configDebounce,
        debouncePath,
        configDebounce.default,
      );
      if (!isObject(debounceType)) {
        targetDelayTimes.push(debounceType);
        continue;
      }

      if (!debounceType.arrayType) {
        targetDelayTimes.push(configDebounce.default);
        continue;
      }

      if (!isObject(debounceType.action as DebounceTime)) {
        targetDelayTimes.push(debounceType.action as DebounceTime);
      } else {
        const kind =
          change.kind === 'A' && change.item?.kind
            ? change.item?.kind
            : change.kind;
        const triggerKind = debounceType.action[kind];
        targetDelayTimes.push(triggerKind);
      }
    }

    return Math.min(...targetDelayTimes);
  };

  /**
   * Gets the key that changes the configuration corresponding to the trigger declaration
   * @param changePath diff path
   * @returns path key
   */
  private getdebouncePath = (changePath?: PathType[]) => {
    if (!changePath) {
      return '';
    }

    const indexPath = path => typeof path === 'number';
    const isArrayPath = changePath.some(indexPath);

    if (isArrayPath) {
      return changePath[0];
    }

    return changePath.join('.');
  };
}
