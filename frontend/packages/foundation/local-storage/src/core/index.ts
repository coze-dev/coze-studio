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

import { throttle } from 'lodash-es';
import EventEmitter from 'eventemitter3';

import { filterCacheData, paseLocalStorageValue } from '../utils/parse';
import { type LocalStorageCacheData } from '../types';
import { cacheConfig, type LocalStorageCacheKey } from '../config';

const LOCAL_STORAGE_KEY = '__coz_biz_cache__';

const throttleWait = 300;

class LocalStorageService extends EventEmitter {
  #state: LocalStorageCacheData = {};
  #userId: string | undefined;
  #saveState: () => void;

  constructor() {
    super();
    this.#saveState = throttle(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#state));
    }, throttleWait);
    document.addEventListener('visibilitychange', () => {
      /**
       * After the tab enters the background, by operating other tabs, the #state status may not be the latest
       * So after the tab is reactivated, the data of localStorage needs to be synchronized once.
       */
      if (document.visibilityState === 'visible') {
        this.#initState();
      }
    });
    this.#initState();
  }

  #initState() {
    this.#state = filterCacheData(
      paseLocalStorageValue(localStorage.getItem(LOCAL_STORAGE_KEY)),
    );
    this.emit('change');
  }

  #setPermanent(key: LocalStorageCacheKey, value?: string) {
    if (value) {
      this.#state.permanent = {
        ...this.#state.permanent,
        [key]: value,
      };
    } else if (this.#state.permanent) {
      delete this.#state.permanent[key];
    }
    this.#saveState();
  }

  #setUserRelated(key: LocalStorageCacheKey, value?: string) {
    if (!this.#userId) {
      return;
    }
    if (value) {
      this.#state.userRelated = {
        ...this.#state.userRelated,
        [this.#userId]: {
          ...this.#state.userRelated?.[this.#userId],
          [key]: value,
        },
      };
    } else if (this.#state.userRelated?.[this.#userId]?.[key]) {
      delete this.#state.userRelated?.[this.#userId]?.[key];
    }
    this.#saveState();
  }

  #getPermanent(key: LocalStorageCacheKey) {
    return this.#state.permanent?.[key];
  }

  #getUserRelated(key: LocalStorageCacheKey) {
    if (!this.#userId) {
      if (IS_DEV_MODE) {
        throw Error(
          '需要确保在 userId 初始化后再调用此方法 或者使用 getValueSync',
        );
      }
      return undefined;
    }
    return this.#state.userRelated?.[this.#userId]?.[key];
  }

  #waitUserId() {
    return new Promise<string | undefined>(r => {
      const callback = (userId: string) => {
        if (userId) {
          r(this.#userId);
          this.off('setUserId', callback);
        }
      };
      this.on('setUserId', callback);
    });
  }

  setUserId(userId?: string) {
    this.#userId = userId;
    this.emit('change');
    this.emit('setUserId', userId);
  }

  setValue(key: LocalStorageCacheKey, value?: string) {
    const { bindAccount } = cacheConfig[key] ?? {};
    if (bindAccount) {
      if (!this.#userId) {
        return;
      }
      this.#setUserRelated(key, value);
    } else {
      this.#setPermanent(key, value);
    }
    this.emit('change');
  }

  getValue(key: LocalStorageCacheKey): string | undefined {
    const { bindAccount } = cacheConfig[key] ?? {};
    if (bindAccount) {
      return this.#getUserRelated(key);
    }
    return this.#getPermanent(key);
  }

  async getValueSync(key: LocalStorageCacheKey): Promise<string | undefined> {
    const { bindAccount } = cacheConfig[key] ?? {};
    if (bindAccount) {
      if (!this.#userId) {
        await this.#waitUserId();
      }
      return this.#getUserRelated(key);
    }
    return this.#getPermanent(key);
  }
}

export const localStorageService = new LocalStorageService();
