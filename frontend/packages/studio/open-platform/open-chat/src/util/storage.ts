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

import { catchParse, catchStringify, STRINGIFY_ERROR } from './json-handle';

export enum LocalStorageKey {
  ChatHistory = 'ChatHistory',
  UID = 'OpenSDKUID',
}

export type StorageKey = `coze__${LocalStorageKey}__${string}`;

export const getStorageKey = (
  key: LocalStorageKey,
  suffix?: string,
): StorageKey => `coze__${key}__${suffix ?? ''}`;

export const setItem = (key: string, obj: unknown) => {
  const str = catchStringify(obj);
  if (str === STRINGIFY_ERROR) {
    return;
  }

  if (obj) {
    localStorage.setItem(key, str);
  } else {
    localStorage.removeItem(key);
  }
};

export const getItem = <T = unknown>(key: StorageKey, defaultValue: T) => {
  const str = localStorage.getItem(key);

  if (!str) {
    return defaultValue;
  }

  return catchParse<T>(str, defaultValue);
};

export const storageUtil = {
  setItem,
  getItem,
};
