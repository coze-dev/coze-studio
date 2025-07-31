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

/* eslint-disable @typescript-eslint/naming-convention */
// Values that need to be shared globally can be registered here in advance
interface GlobalVars {
  /**
   * Last Execute ID that extracts from apps/bot/src/store/bot-detail/utils/execute-draft-bot-request-id.ts
   *
   * The log id of the debug record dialogue interface does not need to be reactive, so it is directly stored in const.
   */
  LAST_EXECUTE_ID: string;
  [key: string | symbol]: unknown;
}

const createGlobalVarsStorage = () => {
  const storage = new Map();

  return new Proxy<GlobalVars>(Object.create(null), {
    get<T extends keyof GlobalVars>(_: unknown, prop: T): GlobalVars[T] {
      if (storage.has(prop)) {
        return storage.get(prop as string);
      }
      // add more logic for dev mode
      return undefined;
    },
    set<T extends keyof GlobalVars>(_: unknown, prop: T, value: GlobalVars[T]) {
      storage.set(prop, value);
      return true;
    },
  }) as GlobalVars;
};

/**
 * universal global variable
 */
export const globalVars = createGlobalVarsStorage();
