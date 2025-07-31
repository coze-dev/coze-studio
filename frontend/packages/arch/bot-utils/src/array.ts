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

// Region array2Map Overload Statement
// Although similar to OptionUtil.array2Map, it is still very different in terms of usage and type constraints
/**
 * Convert a list to a map
 * @param items
 * @Param key Specifies item [key] as the key of the map
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
 * Convert a list to a map
 * @param items
 * @Param key Specifies item [key] as the key of the map
 * @Param value Specifies item [value] as the value of the map
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
 * Convert a list to a map
 * @param items
 * @Param key Specifies item [key] as the key of the map
 * @param value get value
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
/** Convert a list to a map */
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
      // If filtered is false, this item needs to be skipped
      return previousValue;
    }
    // If filtered is true, it means that this item needs to be added
    return [...previousValue, realValue] as Array<I>;
  }, [] as Array<I>);
}
