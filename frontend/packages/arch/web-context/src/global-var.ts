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
// 需要全局共享的值，可以提前到这里注册类型
interface GlobalVars {
  /**
   * Last Execute ID that extracts from apps/bot/src/store/bot-detail/utils/execute-draft-bot-request-id.ts
   *
   * 用于 debug 记录对话接口的 log id，不需要响应式，所以直接存 const 里了
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
 * 通用全局变量
 */
export const globalVars = createGlobalVarsStorage();
