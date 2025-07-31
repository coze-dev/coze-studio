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

import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@coze-editor/editor/preset-expression';
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
