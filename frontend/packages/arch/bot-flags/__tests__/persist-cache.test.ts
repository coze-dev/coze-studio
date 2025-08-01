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

import { logger } from '@coze-arch/logger';

import { readFromCache, saveToCache } from '../src/utils/persist-cache'; // Adjust the import path

// Mocking localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('Feature Flags Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readFromCache', () => {
    it('should return undefined if cache is empty', async () => {
      localStorageMock.getItem.mockReturnValueOnce(undefined);
      const result = await readFromCache();
      expect(result).toBeUndefined();
    });

    it('should return feature flags if cache has valid data', async () => {
      const validFlags = { feature1: true, feature2: false };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(validFlags));
      const result = await readFromCache();
      expect(result).toEqual(validFlags);
    });

    it('should return undefined if cache has invalid data', async () => {
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ invalid: 'data' }),
      );
      const result = await readFromCache();
      expect(result).toBeUndefined();
    });
  });

  describe('saveToCache', () => {
    it('should save feature flags to cache', async () => {
      const flags = { feature1: true, feature2: false };
      await saveToCache(flags);
      expect(localStorageMock.setItem).toBeCalledWith(
        'cache:@coze-arch/bot-flags',
        JSON.stringify(flags),
      );
    });

    it('should save feature flags to cache', async () => {
      await saveToCache({ fg: 'test' });
      expect(localStorageMock.setItem).not.toBeCalled();
    });

    it('should save feature flags to cache', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('test');
      });
      await saveToCache({ feature: true });
      expect(logger.persist.error).toBeCalled();
    });
  });
});
