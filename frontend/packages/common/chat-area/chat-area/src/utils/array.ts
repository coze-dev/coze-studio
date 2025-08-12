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

/**
 * Cut a section of the size of the left and right sides of the center position from the list to reduce the amount of search calculation
 */
export const sliceArrayByIndexRange = <T>(
  array: T[],
  center: number,
  side: number,
) => {
  const start = Math.max(center - side, 0);
  const end = Math.min(center + side, array.length);
  return array.slice(start, end);
};

/**
 * notice: execute mutable change
 */
export const uniquePush = <T extends string | number>(
  arr: T[],
  val: T,
): void => {
  if (arr.includes(val)) {
    return;
  }
  arr.push(val);
};
