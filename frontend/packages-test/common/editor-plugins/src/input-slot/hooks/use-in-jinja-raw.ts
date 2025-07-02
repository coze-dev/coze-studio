import { useEffect, useState } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { syntaxTree } from '@codemirror/language';

export const useSelectionInJinjaRaw = () => {
  const editor = useEditor<EditorAPI>();
  const [inJinjaRaw, setInJinjaRaw] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const checkInJinjaRaw = () => {
      const selection = editor.getSelection();
      if (!selection) {
        setInJinjaRaw(false);
        return;
      }

      const { state } = editor.$view;
      const tree = syntaxTree(state);
      const cursor = tree.cursor();

      let isInRaw = false;
      do {
        if (cursor.name === 'RawText') {
          const isSelectionWithinNode =
            cursor.from <= selection.from && cursor.to >= selection.to;
          if (isSelectionWithinNode) {
            isInRaw = true;
            break;
          }
        }
      } while (cursor.next());

      setInJinjaRaw(isInRaw);
    };

    editor.$on('viewUpdate', checkInJinjaRaw);

    // 初始检查
    checkInJinjaRaw();

    return () => {
      editor.$off('viewUpdate', checkInJinjaRaw);
    };
  }, [editor]);

  return inJinjaRaw;
};
