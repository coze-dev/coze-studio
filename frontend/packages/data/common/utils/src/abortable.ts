import { useRef, useEffect } from 'react';

export function useUnmountSignal() {
  const controllerRef = useRef<AbortController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = new AbortController();
  }

  useEffect(
    () => () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    },
    [],
  );

  return controllerRef.current.signal;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 得是 any
export function abortable<T extends (...args: any[]) => any | Promise<any>>(
  func: T,
  abortSignal: AbortSignal,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args) => {
    try {
      if (abortSignal.aborted) {
        throw new Error('Function aborted');
      }

      const result = func(...args);

      if (result instanceof Promise) {
        return await Promise.race([
          result,
          new Promise((_, reject) => {
            abortSignal.addEventListener(
              'abort',
              () => reject(new Error('Function aborted')),
              { once: true },
            );
          }),
        ]);
      }

      return result;
    } catch (e) {
      console.log(e);
      // TODO: error handling
    }
  };
}
