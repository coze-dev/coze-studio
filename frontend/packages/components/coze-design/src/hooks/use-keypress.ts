import { useEffect } from 'react';

export function useKeypress(
  key: string,
  active?: boolean,
  callback?: (event: KeyboardEvent) => void,
): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const handle = (event: KeyboardEvent) => {
      if (event.key === key && callback) {
        callback(event);

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handle);

    return () => {
      document.removeEventListener('keydown', handle);
    };
  }, [key, callback, active]);
}
