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

import { type MaybeArray, type MaybePromise } from '@flowgram-adapter/common';

export interface Priority<T> {
  readonly priority: number;
  readonly value: T;
}

type GetPriority<T> = (value: T) => MaybePromise<number>;
type GetPrioritySync<T> = (value: T) => number;

export function isValid<T>(p: Priority<T>): boolean {
  return p.priority > 0;
}

export function compare<T>(p: Priority<T>, p2: Priority<T>): number {
  return p2.priority - p.priority;
}

export async function toPriority<T>(
  rawValue: MaybePromise<T>,
  getPriority: GetPriority<T>,
): Promise<Priority<T>>;
export async function toPriority<T>(
  rawValue: MaybePromise<T>[],
  getPriority: GetPriority<T>,
): Promise<Priority<T>[]>;
export async function toPriority<T>(
  rawValue: MaybeArray<MaybePromise<T>>,
  getPriority: GetPriority<T>,
): Promise<MaybeArray<Priority<T>>> {
  if (rawValue instanceof Array) {
    return Promise.all(rawValue.map(v => toPriority(v, getPriority)));
  }
  const value = await rawValue;
  const priority = await getPriority(value);
  return { priority, value };
}

export function toPrioritySync<T>(
  rawValue: T[],
  getPriority: GetPrioritySync<T>,
): Priority<T>[] {
  return rawValue.map(v => ({
    value: v,
    priority: getPriority(v),
  }));
}

export function prioritizeAllSync<T>(
  values: T[],
  getPriority: GetPrioritySync<T>,
): Priority<T>[] {
  const priority = toPrioritySync(values, getPriority);
  return priority.filter(isValid).sort(compare);
}

export async function prioritizeAll<T>(
  values: MaybePromise<T>[],
  getPriority: GetPriority<T>,
): Promise<Priority<T>[]> {
  const priority = await toPriority(values, getPriority);
  return priority.filter(isValid).sort(compare);
}
