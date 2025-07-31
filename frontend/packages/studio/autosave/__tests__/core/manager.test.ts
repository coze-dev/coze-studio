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

import { DebounceTime } from '../../src/type';
import { AutosaveManager } from '../../src/core/manager';

vi.mock('lodash-es', () => ({
  debounce: vi.fn((func, wait) => {
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
  }),
}));

const mockStore = {
  subscribe: vi.fn().mockReturnValue(() => {
    console.log('Unsubscribed');
  }),
} as unknown as UseBoundStore<StoreApi<any>>;

describe('AutosaveManager', () => {
  let manager;
  const saveRequest = vi.fn().mockResolvedValue(Promise.resolve());

  const registers = [
    {
      key: 'testKey',
      debounce: DebounceTime.Immediate,
      selector: state => state,
    },
  ];

  beforeEach(() => {
    manager = new AutosaveManager({
      store: mockStore,
      registers,
      saveRequest,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and set initial values correctly', () => {
    expect(manager.observerList.length).toBe(0);
    expect(manager.configList).toMatchObject(
      registers.map(r => ({
        ...r,
        eventCallBacks: undefined,
        saveRequest,
      })),
    );
  });

  it('should start observers correctly', () => {
    manager.start();

    expect(manager.observerList.length).toBe(1);
    const observer = manager.observerList[0];
    expect(observer.config.key).toBe('testKey');
    expect(observer.config.saveRequest).toBe(saveRequest);
  });

  it('should not start observers if already started', () => {
    manager.start();
    expect(manager.observerList.length).toBe(1);

    manager.start(); // Call start again.
    expect(manager.observerList.length).toBe(1);
  });

  it('should handle manualSave correctly when config is undefined', async () => {
    await manager.manualSave('undefinedKey', { value: 'test' });

    expect(saveRequest).not.toHaveBeenCalled();
  });

  it('should close observers correctly', () => {
    manager.start();
    const observer = manager.observerList[0];
    const closeSpy = vi.spyOn(observer, 'close');

    manager.close();

    expect(closeSpy).toHaveBeenCalled();
    expect(manager.observerList.length).toBe(0);
  });

  it('should handle manualSave correctly', async () => {
    const params = { value: 'test' };

    await manager.manualSave('testKey', params);

    expect(saveRequest).toHaveBeenCalledWith(params, 'testKey', []);
  });

  it('call middleware correctly', async () => {
    const mockOnBeforeSave = vi.fn().mockResolvedValue({ value: 'before' });
    const mockOnAfterSave = vi.fn().mockResolvedValue({ value: 'after' });

    const registersWithMiddleware = [
      {
        key: 'testWithMiddlewareKey',
        debounce: DebounceTime.Immediate,
        selector: state => state,
        middleware: {
          onBeforeSave: mockOnBeforeSave,
          onAfterSave: mockOnAfterSave,
        },
      },
    ];

    manager = new AutosaveManager({
      store: mockStore,
      registers: registersWithMiddleware,
      saveRequest,
    });

    const params = { value: 'test' };

    await manager.manualSave('testWithMiddlewareKey', params);

    expect(mockOnBeforeSave).toHaveBeenCalledWith(params);
    expect(saveRequest).toHaveBeenCalledWith(
      { value: 'before' },
      'testWithMiddlewareKey',
      [],
    );
    expect(mockOnAfterSave).toHaveBeenCalledWith(params);
  });

  it('should call eventCallBacks', async () => {
    const onBeforeSaveCallback = vi.fn();
    const onAfterSaveCallback = vi.fn();
    const eventCallBacks = {
      onBeforeSave: onBeforeSaveCallback,
      onAfterSave: onAfterSaveCallback,
    };
    manager = new AutosaveManager({
      store: mockStore,
      registers,
      saveRequest,
      eventCallBacks,
    });

    await manager.manualSave('testKey', { value: 'test' });

    expect(onBeforeSaveCallback).toHaveBeenCalledWith({ value: 'test' });
    expect(onAfterSaveCallback).toHaveBeenCalledWith({ value: 'test' });
  });

  it('should save without auto save', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    manager.start();

    await manager.handleWithoutAutosave({
      key: 'testKey',
      handler,
    });

    const observer = manager.getObserver('testKey');
    // Make sure all asynchronous operations are completed
    await Promise.resolve();

    expect(observer.lock).toBe(false);
    expect(handler).toHaveBeenCalled();
  });

  it('should save flush correctly', async () => {
    manager.start();

    vi.spyOn(manager, 'getObserver').mockReturnValue({
      debouncedSaveFunc: {
        flush: vi.fn(),
      },
    });

    await manager.saveFlush('testKey');

    const observer = manager.getObserver('testKey');
    expect(observer.debouncedSaveFunc.flush).toHaveBeenCalled();
  });

  it('should save flush all correctly', async () => {
    manager.start();
    const observer = manager.getObserver('testKey');
    const nextState = { value: 'next' };
    const prevState = { value: 'prev' };

    vi.spyOn(observer, 'getMemoizeSelector').mockReturnValue(() => nextState);
    vi.spyOn(observer, 'getTriggerDelayTime').mockReturnValue(1000);

    await observer.subscribeCallback(nextState, prevState);

    manager.observerList.forEach(ob => {
      ob.debouncedSaveFunc.flush = vi.fn();
    });

    manager.saveFlushAll();

    manager.observerList.forEach(ob => {
      expect(ob.debouncedSaveFunc.flush).toHaveBeenCalled();
    });
  });
});
