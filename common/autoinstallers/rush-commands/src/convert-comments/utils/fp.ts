import { Result } from '../types/index';

/**
 * 函数组合 - 从左到右执行
 */
export const pipe =
  <T>(...fns: Function[]) =>
  (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

/**
 * 函数组合 - 从右到左执行
 */
export const compose =
  <T>(...fns: Function[]) =>
  (value: T) =>
    fns.reduceRight((acc, fn) => fn(acc), value);

/**
 * 柯里化函数
 */
export const curry =
  (fn: Function) =>
  (...args: any[]) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more: any[]) => curry(fn)(...args, ...more);

/**
 * 异步映射
 */
export const asyncMap = curry(
  async <T, U>(fn: (item: T) => Promise<U>, items: T[]): Promise<U[]> =>
    Promise.all(items.map(fn)),
);

/**
 * 异步过滤
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
 * 异步归约
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
 * 创建成功结果
 */
export const success = <T>(data: T): Result<T> => ({ success: true, data });

/**
 * 创建失败结果
 */
export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * 安全的异步操作包装
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
 * 同步版本的安全操作包装
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
 * 数组分块
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 延迟执行
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 重试机制
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
        await delay(delayMs * attempt); // 指数退避
      }
    }
  }

  throw lastError!;
};

/**
 * 深度合并对象
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
