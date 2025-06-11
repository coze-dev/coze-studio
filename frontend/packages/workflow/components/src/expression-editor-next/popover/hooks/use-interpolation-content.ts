import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@flow-lang-sdk/editor/preset-expression';
import { type EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { type InterpolationContent } from './types';

function getInterpolationContentAtPos(view: EditorView, pos: number) {
  const tree = syntaxTree(view.state);
  const cursor = tree.cursorAt(pos);

  do {
    if (
      cursor.node.type.name === 'Interpolation' &&
      cursor.node.firstChild &&
      cursor.node.lastChild &&
      pos >= cursor.node.firstChild.to &&
      pos <= cursor.node.lastChild.from
    ) {
      const text = view.state.sliceDoc(
        cursor.node.firstChild.to,
        cursor.node.lastChild.from,
      );
      const offset = pos - cursor.node.firstChild.to;
      return {
        from: cursor.node.firstChild.to,
        to: cursor.node.lastChild.from,
        text,
        offset,
        textBefore: text.slice(0, offset),
      };
    }
  } while (cursor.parent());
}

function useInterpolationContent(
  editor: ExpressionEditorAPI | undefined,
  pos: number | undefined,
): InterpolationContent | undefined {
  return useMemo(() => {
    if (!editor || typeof pos === 'undefined') {
      return;
    }

    const view = editor.$view;
    return getInterpolationContentAtPos(view, pos);
  }, [editor, pos]);
}

export { useInterpolationContent };
