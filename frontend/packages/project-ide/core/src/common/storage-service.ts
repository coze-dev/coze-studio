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

import { injectable, postConstruct } from 'inversify';

export const StorageService = Symbol('StorageService');

/**
 * Store data to cache
 */
export interface StorageService {
  /**
   * Stores the given data under the given key.
   */
  setData: <T>(key: string, data: T) => void;

  /**
   * Returns the data stored for the given key or the provided default value if nothing is stored for the given key.
   */
  getData: (<T>(key: string, defaultValue: T) => T) &
    (<T>(key: string) => T | undefined);
}

interface LocalStorage {
  [key: string]: any;
}

@injectable()
export class LocalStorageService implements StorageService {
  private storage: LocalStorage;

  private _prefix = 'flowide:';

  setData<T>(key: string, data: T): void {
    this.storage[this.prefix(key)] = JSON.stringify(data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    const result = this.storage[this.prefix(key)];
    if (result === undefined) {
      return defaultValue as any;
    }
    return JSON.parse(result);
  }

  prefix(key: string) {
    return `${this._prefix}${key}`;
  }

  setPrefix(prefix: string) {
    this._prefix = prefix;
  }

  @postConstruct()
  protected init(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = {};
    }
  }
}
