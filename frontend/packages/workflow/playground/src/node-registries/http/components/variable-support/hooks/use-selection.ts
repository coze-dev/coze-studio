import { useState, useEffect } from 'react';

import { type EditorAPI } from '@flow-lang-sdk/editor/preset-universal';
import { type ViewUpdate } from '@codemirror/view';

import { useLatest, isSkipSelectionChangeUserEvent } from '../utils';

interface Selection {
  anchor: number;
  head: number;
  from: number;
  to: number;
}

function isSameSelection(a?: Selection, b?: Selection) {
  if (!a && !b) {
    return true;
  }

  return (
    a &&
    b &&
    a.anchor === b.anchor &&
    a.head === b.head &&
    a.from === b.from &&
    a.to === b.to
  );
}

function useSelection(editor: EditorAPI | undefined) {
  const [selection, setSelection] = useState<Selection | undefined>();

  const selectionRef = useLatest(selection);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const view = editor.$view;

    function updateSelection(update?: ViewUpdate) {
      // 忽略 replaceTextByRange 导致的 selection change（效果：不触发 selection 变更，进而不显示推荐面板）
      if (update?.transactions.some(tr => isSkipSelectionChangeUserEvent(tr))) {
        setSelection(undefined);
        return;
      }

      const { from, to, anchor, head } = view.state.selection.main;
      const newSelection = { from, to, anchor, head };
      if (isSameSelection(newSelection, selectionRef.current)) {
        return;
      }

      setSelection({ from, to, anchor, head });
    }

    function handleSelectionChange(e: { update: ViewUpdate }) {
      updateSelection(e.update);
    }

    function handleFocus() {
      updateSelection();
    }

    editor.$on('selectionChange', handleSelectionChange);
    editor.$on('focus', handleFocus);

    return () => {
      editor.$off('selectionChange', handleSelectionChange);
      editor.$off('focus', handleFocus);
    };
  }, [editor]);

  return selection;
}

export { useSelection };
