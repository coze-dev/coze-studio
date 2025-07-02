import { useRef, useCallback, useMemo } from 'react';

function usePersistCallback<T extends (...args: any[]) => any>(fn?: T) {
  const ref = useRef<T>();

  ref.current = useMemo(() => fn, [fn]);

  return useCallback<T>(
    // @ts-expect-error ignore
    (...args) => {
      const f = ref.current;
      return f && f(...args);
    },
    [ref],
  );
}
export default usePersistCallback;
