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
