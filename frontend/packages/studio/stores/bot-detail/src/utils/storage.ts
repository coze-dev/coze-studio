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

import { useCollaborationStore } from '../store/collaboration';

export function createStorage<T extends object>(
  s: Storage,
  target: T,
  prefix = 'common_storage',
) {
  return new Proxy(target, {
    set: (_, prop: string, value) => {
      if (typeof value === 'string') {
        s.setItem(`${prefix}.${prop}`, value);
        return true;
      }
      return false;
    },
    get: (_, prop: string) => s.getItem(`${prefix}.${prop}`) ?? undefined,
    deleteProperty: (_, prop): boolean => {
      if (typeof prop === 'string') {
        s.removeItem(`${prefix}.${prop}`);
      }
      return true;
    },
  });
}
export const storageLocal = createStorage<Record<string, string | undefined>>(
  localStorage,
  {},
);

// NOTICE: Custom logic: baseVersion to get from bot_detail_store
export const storage = new Proxy(storageLocal, {
  get: (target, prop: string, receiver) => {
    if (prop === 'baseVersion') {
      return useCollaborationStore.getState().getBaseVersion();
    }
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, ...rest) {
    if (prop === 'baseVersion') {
      console.error(
        'you should use botDetailStore instead of storage to keep base_commit_version',
      );
      return false;
    }
    return Reflect.set(target, prop, ...rest);
  },
});
