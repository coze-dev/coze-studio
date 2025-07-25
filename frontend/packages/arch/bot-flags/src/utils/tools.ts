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
 
export const isObject = (obj: unknown) => typeof obj === 'object';

export const isEqual = (
  obj1: Record<string, boolean> | undefined,
  obj2: Record<string, boolean> | undefined,
) => {
  // 有任意一个不是对象时，则直接返回 false
  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }
  const o1 = obj1 as Record<string, boolean>;
  const o2 = obj2 as Record<string, boolean>;

  // 检查两个对象有相同的键数，如果数量不同，则一定不相等
  if (Object.keys(o1).length !== Object.keys(o2).length) {
    return false;
  }

  // 如果键数相同，然后我们检查每个键的值
  for (const key in o1) {
    // 如果键不存在于第二个对象，或者值不同，返回false
    if (!(key in o2) || o1[key] !== o2[key]) {
      return false;
    }
  }

  // 如果所有键都存在于两个对象，并且所有的值都相同，返回 true
  return true;
};
