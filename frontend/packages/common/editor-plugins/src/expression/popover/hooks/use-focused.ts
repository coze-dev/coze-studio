import { useState, useEffect } from 'react';

import { type EditorAPI } from '@flow-lang-sdk/editor/preset-expression';

function useFocused(editor: EditorAPI | undefined) {
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
