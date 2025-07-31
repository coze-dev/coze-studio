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

import { useEffect, useLayoutEffect } from 'react';

import { useEditor, useInjector } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-expression';
import { astDecorator } from '@coze-editor/editor';
import { EditorView } from '@codemirror/view';

import { useDeepEqualMemo, useLatest } from '../shared';
import { type ExpressionEditorTreeNode } from '../core';
import { validateExpression } from './validate';

interface Props {
  variableTree: ExpressionEditorTreeNode[];
}

function Validation({ variableTree }: Props) {
  const editor = useEditor<EditorAPI>();
  const editorRef = useLatest(editor);
  const injector = useInjector();
  const variableTreeRef = useLatest(variableTree);
  const changedVariableTree = useDeepEqualMemo(variableTree);

  useEffect(() => {
    if (!editor) {
      return;
    }

    function handleFocus() {
      editor.updateWholeDecorations();
    }

    editor.$on('focus', handleFocus);

    return () => {
      editor.$off('focus', handleFocus);
    };
  }, [editor]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.updateWholeDecorations();
  }, [changedVariableTree]);

  useLayoutEffect(() =>
    injector.inject([
      [
        astDecorator.whole.of((cursor, state) => {
          if (!variableTreeRef.current) {
            return;
          }

          if (
            cursor.name === 'JinjaExpression' &&
            // Due to the fault tolerance of the parser
            // It is possible that the missing right curly brace is also parsed normally as Interpolation
            // Such as: {{variable
            cursor.node.firstChild?.name === 'JinjaExpressionStart' &&
            cursor.node.lastChild?.name === 'JinjaExpressionEnd'
          ) {
            const source = state.sliceDoc(
              cursor.node.firstChild.to,
              cursor.node.lastChild.from,
            );

            const isValid = validateExpression(source, variableTreeRef.current);

            if (isValid) {
              return {
                type: 'className',
                className: 'cm-decoration-interpolation-valid',
              };
            }

            return {
              type: 'className',
              className: 'cm-decoration-interpolation-invalid',
            };
          }
        }),
        EditorView.theme({
          '.cm-decoration-interpolation-valid': {
            color: '#6675D9',
            caretColor: '#6675D9',
          },
          '.cm-decoration-interpolation-invalid': {
            color: '#060709CC',
          },
        }),
      ],
    ]),
  );

  return null;
}

export { Validation };
