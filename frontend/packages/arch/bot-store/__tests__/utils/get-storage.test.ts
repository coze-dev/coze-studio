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

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the tested module
import localForage from 'localforage';

import { getStorage, clearStorage } from '../../src/utils/get-storage';

vi.mock('localforage', () => ({
  default: {
    createInstance: vi.fn().mockImplementation(
      (() => {
        const cache = {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        };
        return () => cache;
      })(),
    ),
  },
}));

describe('get-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an object with getItem, setItem, and removeItem methods', () => {
    const storage = getStorage();
    expect(storage).toHaveProperty('getItem');
    expect(storage).toHaveProperty('setItem');
    expect(storage).toHaveProperty('removeItem');
  });

  it('getItem should call localforage.getItem with the correct key', async () => {
    const instance = localForage.createInstance();
    instance.getItem.mockResolvedValue('value');
    const storage = getStorage();
    const result = await storage.getItem('key');
    expect(instance.getItem).toHaveBeenCalledWith('key');
    expect(result).toBe('value');
  });

  it('setItem should call localforage.setItem with the correct key and value', async () => {
    const storage = getStorage();
    const instance = localForage.createInstance();
    await storage.setItem('key', 'value');
    expect(instance.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('removeItem should call localforage.removeItem with the correct key', async () => {
    const storage = getStorage();
    await storage.removeItem('key');
    const instance = localForage.createInstance();
    expect(instance.removeItem).toHaveBeenCalledWith('key');
  });

  it('clearStorage should call localforage.clear', async () => {
    await clearStorage();
    const instance = localForage.createInstance();
    expect(instance.clear).toHaveBeenCalled();
  });
});
