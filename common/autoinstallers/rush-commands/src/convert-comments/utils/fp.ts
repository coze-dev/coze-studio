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

import { Result } from '../types/index';

/**
 * Function composition - executed from left to right
 */
export const pipe =
  <T>(...fns: Function[]) =>
  (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

/**
 * Function composition - executed from right to left
 */
export const compose =
  <T>(...fns: Function[]) =>
  (value: T) =>
    fns.reduceRight((acc, fn) => fn(acc), value);

/**
 * currying function
 */
export const curry =
  (fn: Function) =>
  (...args: any[]) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more: any[]) => curry(fn)(...args, ...more);

/**
 * asynchronous mapping
 */
export const asyncMap = curry(
  async <T, U>(fn: (item: T) => Promise<U>, items: T[]): Promise<U[]> =>
    Promise.all(items.map(fn)),
);

/**
 * asynchronous filtering
 */
export const asyncFilter = curry(
  async <T>(
    predicate: (item: T) => Promise<boolean>,
    items: T[],
  ): Promise<T[]> => {
    const results = await Promise.all(items.map(predicate));
    return items.filter((_, index) => results[index]);
  },
);

/**
 * asynchronous reduction
 */
export const asyncReduce = curry(
  async <T, U>(
    fn: (acc: U, item: T) => Promise<U>,
    initial: U,
    items: T[],
  ): Promise<U> => {
    let result = initial;
    for (const item of items) {
      result = await fn(result, item);
    }
    return result;
  },
);

/**
 * Create a successful result
 */
export const success = <T>(data: T): Result<T> => ({ success: true, data });

/**
 * Create failed result
 */
export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Safe asynchronous packaging
 */
export const tryCatch = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Synchronized version of the security operation wrapper
 */
export const tryCatchSync = <T>(fn: () => T): Result<T> => {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Array chunking
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * delayed execution
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * retry mechanism
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        await delay(delayMs * attempt); // exponential backoff
      }
    }
  }

  throw lastError!;
};

/**
 * deep merge object
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T => {
  const result = { ...target } as T;

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        (result as any)[key] = deepMerge(target[key], source[key]!);
      } else {
        (result as any)[key] = source[key]!;
      }
    }
  }

  return result;
};
