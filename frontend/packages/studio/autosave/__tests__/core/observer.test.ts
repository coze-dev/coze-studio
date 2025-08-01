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
import { describe, beforeEach, afterEach, vi, expect } from 'vitest';
import { diff, type Diff } from 'deep-diff';

import { DebounceTime, type AutosaveObserverConfig } from '../../src/type';
import { AutosaveObserver } from '../../src/core/observer';

const debounceMock = vi.fn((func, wait) => {
  let timeout;
  const debounced = (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = vi.fn(() => clearTimeout(timeout));
  debounced.flush = vi.fn(() => {
    if (timeout) {
      clearTimeout(timeout);
      func();
    }
  });
  return debounced;
});

vi.mock('lodash-es/debounce', () => {
  const originalModule = vi.importActual('lodash-es/debounce');
  return {
    __esModule: true,
    default: debounceMock,
    ...originalModule,
  };
});

const mockStore = {
  subscribe: vi.fn(),
} as unknown as UseBoundStore<StoreApi<any>>;

describe('AutosaveObserver', () => {
  let observer;
  const saveRequest = vi.fn().mockResolvedValue(Promise.resolve());

  const config: AutosaveObserverConfig<any, any, any> = {
    key: 'testKey',
    debounce: DebounceTime.Immediate,
    selector: state => state,
    saveRequest,
  };

  beforeEach(() => {
    vi.useFakeTimers(); // Use a hypothetical timer

    observer = new AutosaveObserver({
      store: mockStore,
      ...config,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers(); // Restore the real timer
  });

  it('should initialize and set initial values correctly', () => {
    expect(observer.lock).toBe(false);
    expect(observer.config).toStrictEqual(config);
    expect(observer.store).toBe(mockStore);
    expect(mockStore.subscribe).toHaveBeenCalled();
  });

  it('should trigger callback and parsedSaveFunc', async () => {
    const nextState = { value: 'next' };
    const prevState = { value: 'prev' };
    const diffChange: Diff<any, any>[] = [
      {
        kind: 'E',
        path: ['value'],
        lhs: 'prev',
        rhs: 'next',
      },
    ];

    vi.spyOn(observer, 'getMemoizeSelector').mockReturnValue(() => nextState);
    vi.spyOn(observer, 'getTriggerDelayTime').mockReturnValue(0);

    await observer.subscribeCallback(nextState, prevState);

    expect(observer.nextState).toBe(nextState);
    expect(observer.prevState).toBe(prevState);
    expect(observer.diff).toEqual(diffChange);
    expect(saveRequest).toHaveBeenCalledWith(nextState, 'testKey', diffChange);
  });

  it('should handle array diff change', async () => {
    const nextState = { value: [1, 2, 3] };
    const prevState = { value: [1, 2] };
    const diffChange = diff(prevState, nextState);

    vi.spyOn(observer, 'getMemoizeSelector').mockReturnValue(() => nextState);
    vi.spyOn(observer, 'getTriggerDelayTime').mockReturnValue(500);

    await observer.subscribeCallback(nextState, prevState);

    expect(observer.debouncedSaveFunc).toBeInstanceOf(Function);

    vi.runAllTimers(); // Manually advance the timer time to trigger the stabilization function

    await vi.runAllTimersAsync(); // Make sure all asynchronous operations are completed

    expect(saveRequest).toHaveBeenCalledWith(nextState, 'testKey', diffChange);
  });

  it('should cancel and unsubscribe correctly', async () => {
    const prevState = {
      value: {
        a: 1,
      },
    };
    const nextState = {
      value: {
        a: 2,
      },
    };
    vi.spyOn(observer, 'getMemoizeSelector').mockReturnValue(() => nextState);
    vi.spyOn(observer, 'getTriggerDelayTime').mockReturnValue(1000);

    await observer.subscribeCallback(nextState, prevState);

    const cancelSpy = vi.spyOn(observer.debouncedSaveFunc, 'flush');
    const unsubscribeSpy = vi.spyOn(observer, 'unsubscribe');

    observer.close();

    expect(cancelSpy).toHaveBeenCalled();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('selector with deps', () => {
    const deps = [state => state.value];
    const transformer = value => value * 2;

    const observerConfig: AutosaveObserverConfig<any, any, any> = {
      ...config,
      selector: { deps, transformer },
    };

    observer = new AutosaveObserver({
      store: mockStore,
      ...observerConfig,
    });

    const selector = observer.getMemoizeSelector();

    const state = { value: 3 };
    const result = selector(state);

    expect(result).toBe(transformer(3));
  });

  it('should return in callback if lock is true', async () => {
    observer.lock = true;
    const nextState = { value: 'next' };
    const prevState = { value: 'prev' };

    const getTriggerDelayTimeSpy = vi.spyOn(observer, 'getTriggerDelayTime');
    const parsedSaveFuncSpy = vi.spyOn(observer, 'parsedSaveFunc');

    await observer.subscribeCallback(nextState, prevState);

    expect(observer.nextState).toBe(nextState);
    expect(observer.prevState).toBe(prevState);
    expect(getTriggerDelayTimeSpy).not.toHaveBeenCalled();
    expect(parsedSaveFuncSpy).not.toHaveBeenCalled();
  });

  it('should return in callback if diffChange is undefined', async () => {
    const nextState = { value: 'prev' };
    const prevState = { value: 'prev' };

    const getTriggerDelayTimeSpy = vi.spyOn(observer, 'getTriggerDelayTime');
    const parsedSaveFuncSpy = vi.spyOn(observer, 'parsedSaveFunc');

    await observer.subscribeCallback(nextState, prevState);

    expect(observer.nextState).toBe(nextState);
    expect(observer.prevState).toBe(prevState);
    expect(getTriggerDelayTimeSpy).not.toHaveBeenCalled();
    expect(parsedSaveFuncSpy).not.toHaveBeenCalled();
  });

  it('should call onBeforeSave lifecycle callback', async () => {
    const onBeforeSave = vi.fn();
    observer.config.eventCallBacks = { onBeforeSave };
    observer.nextState = { value: 'next' };

    await observer.parsedSaveFunc();

    expect(onBeforeSave).toHaveBeenCalledWith({
      key: observer.config.key,
      data: observer.nextState,
    });
  });

  it('should call onAfterSave lifecycle callback', async () => {
    const onAfterSave = vi.fn();
    observer.config.eventCallBacks = { onAfterSave };
    observer.nextState = { value: 'next' };

    await observer.parsedSaveFunc();

    expect(onAfterSave).toHaveBeenCalledWith({
      key: observer.config.key,
      data: observer.nextState,
    });
  });

  it('should call onError lifecycle method on error', async () => {
    const onError = vi.fn();
    observer.config.eventCallBacks = { onError };

    saveRequest.mockRejectedValueOnce(new Error('Failed request'));
    observer.nextState = { value: 'next' };

    await observer.parsedSaveFunc();

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        key: observer.config.key,
        error: expect.any(Error),
      }),
    );
  });

  it('should return the correct delay time based on debounce configuration', () => {
    const prevState = { value: 'prev' };
    const diffChange = [{ kind: 'E', path: ['value'] }];

    observer.config.debounce = () => 200;
    expect(observer.getTriggerDelayTime(prevState, diffChange)).toBe(200);

    observer.config.debounce = { default: 300 };
    expect(observer.getTriggerDelayTime(prevState, diffChange)).toBe(300);

    observer.config.debounce = 100;
    expect(observer.getTriggerDelayTime(prevState, diffChange)).toBe(100);

    observer.config.debounce = null;
    expect(observer.getTriggerDelayTime(prevState, diffChange)).toBe(
      DebounceTime.Immediate,
    );
  });

  it('should return default debounce time when diffChange is empty or undefined', () => {
    const prevState = {};
    const diffChange = undefined;

    const delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(DebounceTime.Immediate);
  });

  it('should push default debounce time when changePath does not exist or is a number', () => {
    const prevState = { value: 'prev' };
    const diffChange: Diff<any, any>[] = [
      {
        kind: 'E',
        path: [123],
        lhs: 'prev',
        rhs: 'next',
      },
    ];

    const delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(DebounceTime.Immediate);
  });

  it('should push action delay time when DebounceConfig.action is not an object', () => {
    const prevState = { value: 'prev' };
    const diffChange = [
      {
        kind: 'E',
        path: ['value'],
        lhs: 'prev',
        rhs: 'next',
      },
    ];

    const debounceActionTime = DebounceTime.Long;

    observer.config.debounce = {
      default: DebounceTime.Long,
      value: {
        action: debounceActionTime,
      },
    };

    const delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(debounceActionTime);
  });

  it('should return an empty string if changePath does not exist', () => {
    const changePath = undefined;
    const debouncePath = observer.getdebouncePath(changePath);
    expect(debouncePath).toBe('');
  });

  it('should return the first element of changePath', () => {
    const changePath = ['value', 0, 'key'];
    const debouncePath = observer.getdebouncePath(changePath);
    expect(debouncePath).toBe('value');
  });

  it('should return default debounce time when diffChange is undefined or empty', () => {
    const prevState = {};
    let diffChange: Diff<any, any>[] | undefined = undefined;

    let delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(DebounceTime.Immediate);

    diffChange = [];
    delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(DebounceTime.Immediate);
  });

  it('should push default debounce time when changePath does not exist or has conditions', () => {
    const prevState = { value: 'prev' };
    observer.config.debounce = { default: DebounceTime.Long };
    const diffChange = [
      { kind: 'E', path: undefined },
      { kind: 'E', path: ['nonexistentPath'] },
      { kind: 'E', path: [123] },
    ];

    vi.spyOn(observer, 'getdebouncePath').mockReturnValue(123);

    const delayTime = observer.getTriggerDelayTime(prevState, diffChange);
    expect(delayTime).toBe(DebounceTime.Long);
  });
});
