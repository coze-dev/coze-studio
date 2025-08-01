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

import { type MutableRefObject, useMemo } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-expression';
import { mixLanguages, astDecorator } from '@coze-editor/editor';
import { EditorView } from '@codemirror/view';

import { type ExpressionEditorTreeNode } from '@/expression-editor/type';

import { validateExpression } from './validate';

function useInputRules(apiRef: MutableRefObject<EditorAPI | null>) {
  return useMemo(
    () => [
      {
        type: 'character' as const,
        triggerCharacter: '{',
        handler({ from, to }) {
          apiRef.current?.replaceTextByRange({
            from,
            to,
            text: '{{}}',
            cursorOffset: -2,
          });
          return true;
        },
      },
    ],
    [],
  );
}

type Extension =
  | {
      extension: Extension;
    }
  | readonly Extension[];

function useExtensions(
  variableTreeRef: MutableRefObject<ExpressionEditorTreeNode[] | undefined>,
): Extension[] {
  return useMemo(
    () => [
      mixLanguages({}),
      EditorView.baseTheme({
        '& .cm-line': {
          padding: 0,
        },
        '& .cm-placeholder': {
          color: 'inherit',
          opacity: 0.333,
        },
        '& .cm-content': {
          wordBreak: 'break-all',
        },
      }),
      [
        astDecorator.whole.of((cursor, state) => {
          if (!variableTreeRef.current) {
            return;
          }

          if (
            cursor.node.type.name === 'Interpolation' &&
            // Due to the fault tolerance of the parser
            // It is possible that the missing right curly brace is also parsed normally as Interpolation
            // Such as: {{variable
            cursor.node.firstChild?.type.name === '{{' &&
            cursor.node.lastChild?.type.name === '}}'
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
        EditorView.baseTheme({
          '& .cm-decoration-interpolation-valid': {
            color: '#6675D9',
            caretColor: '#6675D9',
          },
          // '& .cm-decoration-interpolation-invalid': {
          // },
        }),
      ],
      [
        astDecorator.fromCursor.of((cursor, state) => {
          const { anchor } = state.selection.main;

          const pos = anchor;
          if (
            cursor.node.type.name === 'Interpolation' &&
            cursor.node.firstChild &&
            cursor.node.lastChild &&
            pos >= cursor.node.firstChild.to &&
            pos <= cursor.node.lastChild.from
          ) {
            return {
              type: 'background',
              className: 'cm-decoration-interpolation-active',
              from: cursor.node.firstChild.from,
              to: cursor.node.lastChild.to,
            };
          }
        }),
        EditorView.baseTheme({
          '& .cm-decoration-interpolation-active': {
            borderRadius: '2px',
            backgroundColor:
              'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
          },
        }),
      ],
    ],
    [],
  );
}

export { useInputRules, useExtensions };
