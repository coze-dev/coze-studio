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

import { useLayoutEffect } from 'react';

import { useInjector } from '@coze-editor/editor/react';
import { astDecorator } from '@coze-editor/editor';
import { EditorView } from '@codemirror/view';

function HighlightExpressionOnActive() {
  const injector = useInjector();

  useLayoutEffect(() =>
    injector.inject([
      [
        astDecorator.fromCursor.of((cursor, state) => {
          const { anchor } = state.selection.main;

          const pos = anchor;
          if (
            cursor.name === 'JinjaExpression' &&
            cursor.node.firstChild?.name === 'JinjaExpressionStart' &&
            cursor.node.lastChild?.name === 'JinjaExpressionEnd' &&
            pos >= cursor.node.firstChild.to &&
            pos <= cursor.node.lastChild.from &&
            state.sliceDoc(
              cursor.node.lastChild.from,
              cursor.node.lastChild.to,
            ) === '}}'
          ) {
            return {
              type: 'background',
              className: 'cm-decoration-interpolation-active',
              from: cursor.node.firstChild.from,
              to: cursor.node.lastChild.to,
            };
          }
        }),
        EditorView.theme({
          '.cm-decoration-interpolation-active': {
            borderRadius: '2px',
            backgroundColor:
              'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
          },
        }),
      ],
    ]),
  );

  return null;
}

export { HighlightExpressionOnActive };
