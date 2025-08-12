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

import { type CacheDataItems, type LocalStorageCacheData } from '../types';
import { LOCAL_STORAGE_CACHE_KEYS } from '../config';

const isValidDataItem = (data: unknown): data is CacheDataItems => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return Object.values(data).every(value => typeof value === 'string');
};

const isObject = (value: unknown): value is object =>
  !!value && typeof value === 'object' && value !== null;

// Determines if a value in the local cache matches the LocalStorageCacheData type definition
const isValidCacheData = (value: unknown): value is LocalStorageCacheData => {
  if (!isObject(value)) {
    return false;
  }
  if ('permanent' in value && !isValidDataItem(value.permanent)) {
    return false;
  }
  if ('userRelated' in value) {
    const { userRelated } = value;
    if (!isObject(userRelated)) {
      return false;
    }
    if (
      Object.values(userRelated).some(dateItem => !isValidDataItem(dateItem))
    ) {
      return false;
    }
  }
  return true;
};

export const paseLocalStorageValue = (value: string | null) => {
  if (!value) {
    return {};
  }
  try {
    const raw = JSON.parse(value);
    return isValidCacheData(raw) ? raw : ({} satisfies LocalStorageCacheData);
  } catch (e) {
    return {} satisfies LocalStorageCacheData;
  }
};

const filterDataItems = (data: CacheDataItems): CacheDataItems =>
  Object.entries(data).reduce((res, [key, item]) => {
    if ((LOCAL_STORAGE_CACHE_KEYS as unknown as string[]).includes(key)) {
      return {
        ...res,
        [key]: item,
      };
    }
    return res;
  }, {});

export const filterCacheData = (
  cacheData: LocalStorageCacheData,
): LocalStorageCacheData => {
  if (cacheData.permanent) {
    cacheData.permanent = filterDataItems(cacheData.permanent);
  }
  if (cacheData.userRelated) {
    cacheData.userRelated = Object.entries(cacheData.userRelated).reduce(
      (res, [key, value]) => ({
        ...res,
        [key]: filterDataItems(value),
      }),
      {},
    );
  }
  return cacheData;
};
