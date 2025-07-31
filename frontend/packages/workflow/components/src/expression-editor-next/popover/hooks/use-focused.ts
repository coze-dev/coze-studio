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

import { useState, useEffect } from 'react';

function useFocused(editor) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    function handleFocus() {
      setFocused(true);
    }

    function handleBlur() {
      setFocused(false);
    }

    editor.$on('focus', handleFocus);
    editor.$on('blur', handleBlur);

    return () => {
      editor.$off('focus', handleFocus);
      editor.$off('blur', handleBlur);
    };
  }, [editor]);

  return focused;
}

export { useFocused };
