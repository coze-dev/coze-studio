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
