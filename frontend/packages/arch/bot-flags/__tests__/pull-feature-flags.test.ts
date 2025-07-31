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

import { type Mock } from 'vitest';

import { featureFlagStorage } from '../src/utils/storage';
import {
  readFgPromiseFromContext,
  readFgValuesFromContext,
} from '../src/utils/read-from-context';
import { readFromCache, saveToCache } from '../src/utils/persist-cache';

const fetchFeatureGating = vi.fn();

const $wait = ms => new Promise(r => setTimeout(r, ms));
vi.mock('../src/utils/wait', () => ({
  wait: vi.fn().mockImplementation($wait),
  ONE_SEC: 1000,
  nextTick: vi.fn().mockImplementation(async () => {
    await $wait(10);
  }),
}));

vi.mock('../src/utils/persist-cache', () => ({
  readFromCache: vi.fn(),
  saveToCache: vi.fn(),
}));

vi.mock('../src/utils/read-from-context', () => ({
  readFgPromiseFromContext: vi.fn(),
  readFgValuesFromContext: vi.fn().mockReturnValue(undefined),
}));

vi.mock('../src/utils/storage', () => ({
  featureFlagStorage: {
    setFlags: vi.fn(),
    getFlags: vi.fn().mockReturnValue({}),
  },
}));

describe('pullFeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // Runs successfully with default context
  it('should access values from global static value', async () => {
    (readFgValuesFromContext as Mock).mockReturnValue({ foo: true });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({ fetchFeatureGating });

    expect(readFgValuesFromContext).toBeCalled();
    expect(readFgPromiseFromContext).not.toBeCalled();
    expect(readFromCache).not.toBeCalled();
    expect(fetchFeatureGating).not.toBeCalled();
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: true });
    expect(saveToCache).toBeCalledWith({ foo: true });
  });

  // Runs successfully with default context
  it('should access values from global context', async () => {
    (readFgValuesFromContext as Mock).mockReturnValue(undefined);
    readFgPromiseFromContext.mockResolvedValue({ foo: true });
    readFromCache.mockResolvedValue(undefined);
    fetchFeatureGating.mockResolvedValue(undefined);

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({ fetchFeatureGating });

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: true });
    expect(saveToCache).toBeCalledWith({ foo: true });
  });

  it('should access values from localstorage', async () => {
    readFgPromiseFromContext.mockResolvedValueOnce(undefined);
    readFromCache.mockResolvedValue({ foo: true });
    fetchFeatureGating.mockResolvedValue(undefined);
    readFgPromiseFromContext.mockResolvedValueOnce({ foo: false });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    vi.useFakeTimers();
    const p = pullFeatureFlags({ pollingInterval: 1000, fetchFeatureGating });
    vi.runAllTimersAsync();
    await p;
    vi.useRealTimers();

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(fetchFeatureGating).toBeCalled();
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: true });
  });

  it('should access values from api', async () => {
    readFgPromiseFromContext.mockResolvedValue(undefined);
    readFromCache.mockResolvedValue(undefined);
    fetchFeatureGating.mockResolvedValue({ foo: true });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({ fetchFeatureGating });

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(fetchFeatureGating).toBeCalled();
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: true });
    expect(saveToCache).toBeCalledWith({ foo: true });
  });

  it('should access values from global context firstly', async () => {
    // When getting the value from both localStorage & global context, the context value is preferred
    readFromCache.mockImplementation(async () => {
      await $wait(100);
      return { foo: true };
    });
    readFgPromiseFromContext.mockResolvedValue({ foo: false });
    fetchFeatureGating.mockResolvedValue(undefined);

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({ fetchFeatureGating });

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(fetchFeatureGating).toBeCalled();
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: false });
  });

  it('should fallback to default value', async () => {
    readFromCache.mockResolvedValue(undefined);
    readFgPromiseFromContext.mockResolvedValue(undefined);
    fetchFeatureGating.mockResolvedValueOnce(undefined);

    fetchFeatureGating.mockResolvedValueOnce({ foo: true });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({
      strict: false,
      pollingInterval: 10,
      timeout: 1000,
      fetchFeatureGating,
    });

    expect(readFgPromiseFromContext).toBeCalledTimes(2);
    expect(readFromCache).toBeCalledTimes(2);
    expect(fetchFeatureGating).toBeCalledTimes(2);
    expect(featureFlagStorage.setFlags).toBeCalledWith({});
  });

  it('should throw error with strict mode', async () => {
    readFromCache.mockResolvedValue(undefined);
    readFgPromiseFromContext.mockResolvedValue(undefined);
    fetchFeatureGating.mockResolvedValue(undefined);

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await expect(
      pullFeatureFlags({
        strict: true,
        pollingInterval: 10,
        fetchFeatureGating,
      }),
    ).rejects.toThrowError('Fetch Feature Flags timeout');

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(fetchFeatureGating).toBeCalled();
    expect(featureFlagStorage.setFlags).not.toBeCalled();
  });

  it('should throw error with strict mode once timeout', async () => {
    const resolveAfterTimeout = async () => {
      await $wait(2000);
      return { foo: true };
    };
    readFromCache.mockImplementation(resolveAfterTimeout);
    readFgPromiseFromContext.mockImplementation(resolveAfterTimeout);
    fetchFeatureGating.mockImplementation(resolveAfterTimeout);

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await expect(
      pullFeatureFlags({
        strict: true,
        timeout: 1000,
        pollingInterval: 10,
        fetchFeatureGating,
      }),
    ).rejects.toThrowError('Fetch Feature Flags timeout');

    expect(readFgPromiseFromContext).toBeCalled();
    expect(readFromCache).toBeCalled();
    expect(fetchFeatureGating).toBeCalled();
    expect(featureFlagStorage.setFlags).not.toBeCalled();
  });

  it('should resolve value even if any step failure', async () => {
    readFromCache.mockResolvedValue({ foo: true });
    readFgPromiseFromContext.mockRejectedValue(new Error('jweofj'));
    readFgValuesFromContext.mockReturnValue(undefined);
    fetchFeatureGating.mockRejectedValueOnce(new Error('test'));
    fetchFeatureGating.mockResolvedValue({ foo: false });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    vi.useFakeTimers();
    const p = pullFeatureFlags({
      pollingInterval: 10,
      timeout: 10,
      fetchFeatureGating,
    });
    vi.runAllTimersAsync();
    await p;
    vi.useRealTimers();

    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: true });
    expect(featureFlagStorage.setFlags).toBeCalledWith({ foo: false });
  });

  it('should fallback to default value & and retry even if all step failure', async () => {
    readFromCache.mockRejectedValue(new Error('wfe'));
    readFgPromiseFromContext.mockRejectedValue(new Error('jweofj'));
    fetchFeatureGating.mockRejectedValueOnce(new Error('test'));

    fetchFeatureGating.mockResolvedValue({ foo: true });

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await pullFeatureFlags({ pollingInterval: 10, fetchFeatureGating });

    expect(fetchFeatureGating).toBeCalledTimes(2);
    expect(featureFlagStorage.setFlags.mock.calls[0][0]).toEqual({});
    expect(featureFlagStorage.setFlags.mock.calls[1][0]).toEqual({ foo: true });
  });

  it('should throw Error if all step break down', async () => {
    (readFgValuesFromContext as Mock).mockImplementationOnce(() => {
      throw new Error('test');
    });
    readFromCache.mockRejectedValue(new Error('wfe'));
    readFgPromiseFromContext.mockRejectedValue(new Error('jweofj'));
    fetchFeatureGating.mockRejectedValue(new Error('test'));

    const { pullFeatureFlags } = await import('../src/pull-feature-flags');

    // Invoke function
    await expect(
      pullFeatureFlags({ strict: true, timeout: 1000, fetchFeatureGating }),
    ).rejects.toThrowError('Fetch Feature Flags timeout');

    expect(featureFlagStorage.setFlags).not.toBeCalled();
  });
});
