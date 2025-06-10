import { useEffect } from 'react';

import { useLatest } from '../../shared';

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

    document.addEventListener('keydown', handleKeydown, false);

    return () => {
      document.removeEventListener('keydown', handleKeydown, false);
    };
  }, [enable, keymapRef]);
}

export { useKeyboard };
