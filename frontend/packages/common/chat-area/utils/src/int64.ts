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

import bigInt, { max, min } from 'big-integer';

export const sortInt64CompareFn = (a: string, b: string) =>
  bigInt(a).compare(b);

/** O (1) Traversal */
export const getMinMax = (...nums: string[]) => {
  const num = nums.at(0);
  if (num === undefined) {
    return null;
  }
  let minRes = bigInt(num);
  let maxRes = bigInt(num);
  for (const curStr of nums) {
    const cur = bigInt(curStr);
    minRes = min(minRes, cur);
    maxRes = max(maxRes, cur);
  }
  return {
    min: minRes.toString(),
    max: maxRes.toString(),
  };
};

export const getIsDiffWithinRange = (a: string, b: string, range: number) => {
  const diff = bigInt(a).minus(bigInt(b));
  const abs = diff.abs();
  return abs.lesser(bigInt(range));
};

export const getInt64AbsDifference = (a: string, b: string) => {
  const diff = bigInt(a).minus(bigInt(b));
  const abs = diff.abs();
  return abs.toJSNumber();
};

export const compareInt64 = (a: string) => {
  const bigA = bigInt(a);
  return {
    greaterThan: (b: string) => bigA.greater(bigInt(b)),
    lesserThan: (b: string) => bigA.lesser(bigInt(b)),
    eq: (b: string) => bigA.eq(bigInt(b)),
  };
};

export const compute = (a: string) => {
  const bigA = bigInt(a);
  return {
    add: (b: string) => bigA.add(b).toString(),
    subtract: (b: string) => bigA.subtract(b).toString(),
    prev: () => bigA.prev().toString(),
    next: () => bigA.next().toString(),
  };
};
