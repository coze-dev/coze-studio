import { useEffect } from 'react';

import { useLatest } from '../utils';

type Keymap = Record<string, (e: KeyboardEvent) => void>;

function useKeyboard(enable: boolean, keymap: Keymap) {
  const keymapRef = useLatest(keymap);

  useEffect(() => {
    if (!enable) {
      return;
    }

    function handleKeydown(e: KeyboardEvent) {
      const callback = keymapRef.current[e.key];
      if (typeof callback === 'function') {
        callback(e);
      }
    }

    document.addEventListener('keydown', handleKeydown, true);

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [enable, keymapRef]);
}

export { useKeyboard };
