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
 
import { isFunction } from 'lodash-es';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ArrayUtil = {
  array2Map,
  mapAndFilter,
};

// region array2Map 重载声明
// 和 OptionUtil.array2Map 虽然相似，但在用法和类型约束上还是很不一样的
/**
 * 将列表转化为 map
 * @param items
 * @param key 指定 item[key] 作为 map 的键
 * @example
 * const items = [{name: 'a', id: 1}];
 * array2Map(items, 'id');
 * // {1: {name: 'a', id: 1}}
 */
function array2Map<T extends Obj, K extends keyof T>(
  items: T[],
  key: K,
): Record<T[K], T>;
/**
 * 将列表转化为 map
 * @param items
 * @param key 指定 item[key] 作为 map 的键
 * @param value 指定 item[value] 作为 map 的值
 * @example
 * const items = [{name: 'a', id: 1}];
 * array2Map(items, 'id', 'name');
 * // {1: 'a'}
 */
function array2Map<T extends Obj, K extends keyof T, V extends keyof T>(
  items: T[],
  key: K,
  value: V,
): Record<T[K], T[V]>;
/**
 * 将列表转化为 map
 * @param items
 * @param key 指定 item[key] 作为 map 的键
 * @param value 获取值
 * @example
 * const items = [{name: 'a', id: 1}];
 * array2Map(items, 'id', (item) => `${item.id}-${item.name}`);
 * // {1: '1-a'}
 */
function array2Map<T extends Obj, K extends keyof T, V>(
  items: T[],
  key: K,
  value: (item: T) => V,
): Record<T[K], V>;
// endregion
/* eslint-disable @typescript-eslint/no-explicit-any */
/** 将列表转化为 map */
function array2Map<T extends Obj, K extends keyof T>(
  items: T[],
  key: K,
  value: keyof T | ((item: T) => any) = item => item,
): Partial<Record<T[K], any>> {
  return items.reduce((map, item) => {
    const currKey = String(item[key]);
    const currValue = isFunction(value) ? value(item) : item[value];
    return { ...map, [currKey]: currValue };
  }, {});
}

function mapAndFilter<I extends Obj = Obj>(
  target: Array<I>,
  options?: {
    filter?: (item: I) => boolean;
  },
): Array<I>;
function mapAndFilter<I extends Obj = Obj, T extends Obj = Obj>(
  target: Array<I>,
  options: {
    filter?: (item: I) => boolean;
    map: (item: I) => T;
  },
): Array<T>;
/* eslint-enable @typescript-eslint/no-explicit-any */
function mapAndFilter<I = Obj, T = Obj>(
  target: Array<I>,
  options: {
    filter?: (item: I) => boolean;
    map?: (item: I) => T;
  } = {},
) {
  const { filter, map } = options;
  return target.reduce((previousValue, currentValue) => {
    const realValue = map ? map(currentValue) : currentValue;
    const filtered = filter ? filter(currentValue) : true;
    if (!filtered) {
      // 如果filtered是false，表示此项需要跳过
      return previousValue;
    }
    // 如果filtered是true，表示需要加上此项
    return [...previousValue, realValue] as Array<I>;
  }, [] as Array<I>);
}
