import { useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- .
type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

// https://github.com/Volune/use-event-callback/blob/master/src/index.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- .
export const useEventCallback = <A extends any[], R>(
  fn: Fn<A, R>,
): Fn<A, R> => {
  const ref = useRef(fn);
  ref.current = fn;
  const exposedRef = useRef((...args: A) => ref.current(...args));
  return exposedRef.current;
};
