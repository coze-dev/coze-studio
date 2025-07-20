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
 
import { type StoreBindKey } from '@/store';

type SelfMapping<T extends string> = {
  [K in T]: K; // 关键语法：将每个字面量类型映射为自己
};

type KeyMapping = SelfMapping<StoreBindKey>;

export const isStoreBindConfigured = (
  config: Record<string, string>,
): boolean => {
  // 防止 StoreBindKey 有变动导致 bug
  const { category_id, display_screen }: KeyMapping = {
    category_id: 'category_id',
    display_screen: 'display_screen',
  };
  return Boolean(config[category_id]) && Boolean(config[display_screen]);
};
