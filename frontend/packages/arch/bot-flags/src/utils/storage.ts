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

import EventEmitter from 'eventemitter3';
import { logger } from '@coze-arch/logger';

import type { FEATURE_FLAGS } from '../types';
import { IS_DEV } from '../constant';
import { isEqual } from './tools';

type Interceptor = (key: string) => boolean | undefined;

class FeatureFlagStorage extends EventEmitter {
  #proxy: FEATURE_FLAGS | undefined = undefined;
  #cache: FEATURE_FLAGS | undefined = undefined;
  #inited = false;
  #interceptors: Interceptor[] = [];

  constructor() {
    super();
    // fallback
    this.#interceptors.push((name: string) => {
      const cache = this.#cache;
      if (!cache) {
        return false;
      }

      // Get value from remote
      if (Reflect.has(cache, name)) {
        return Reflect.get(cache, name);
      }
    });

    this.#proxy = new Proxy(Object.create(null), {
      get: (target, name: string) => {
        const cache = this.#cache;
        switch (name) {
          case 'keys': {
            return typeof cache === 'object' ? Reflect.ownKeys(cache) : [];
          }
          case 'isInited': {
            return this.#inited;
          }
          default: {
            return this.#retrieveValueFromInterceptors(name);
          }
        }
      },
      set() {
        throw new Error('Do not set flag value anytime anyway.');
      },
    }) as FEATURE_FLAGS;
  }

  #retrieveValueFromInterceptors(key: string) {
    const interceptors = this.#interceptors;
    for (const func of interceptors) {
      const res = func(key);
      if (typeof res === 'boolean') {
        return res;
      }
    }
    return false;
  }

  // has first set FG value
  get inited() {
    return this.#inited;
  }

  setFlags(values: FEATURE_FLAGS) {
    const cache = this.#cache;

    if (isEqual(cache, values)) {
      return false;
    }
    this.#cache = values;
    this.#inited = true;
    this.notify(values);
    return true;
  }

  notify(values?: FEATURE_FLAGS) {
    this.emit('change', values);
  }

  getFlags(): FEATURE_FLAGS {
    if (!this.#inited) {
      const error = new Error(
        'Trying access feature flag values before the storage been init.',
      );
      logger.persist.error({ namespace: '@coze-arch/bot-flags', error });
      if (IS_DEV) {
        throw error;
      }
    }
    return this.#proxy as FEATURE_FLAGS;
  }

  clear() {
    this.#cache = undefined;
    this.#inited = false;
  }

  use(func: Interceptor) {
    if (typeof func === 'function') {
      this.#interceptors.unshift(func);
    } else {
      throw new Error('Unexpected retrieve func');
    }
  }

  getPureFlags() {
    return this.#cache;
  }
}

// singleton
export const featureFlagStorage = new FeatureFlagStorage();
