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

const prec = 'lowest';

function Markdown() {
  const injector = useInjector();

  useLayoutEffect(
    () =>
      injector.inject([
        astDecorator.whole.of(cursor => {
          // # heading
          if (cursor.name.startsWith('ATXHeading')) {
            return {
              type: 'className',
              className: 'markdown-heading',
              prec,
            };
          }

          // *italic*
          if (cursor.name === 'Emphasis') {
            return {
              type: 'className',
              className: 'markdown-emphasis',
              prec,
            };
          }

          // **bold**
          if (cursor.name === 'StrongEmphasis') {
            return {
              type: 'className',
              className: 'markdown-strong-emphasis',
              prec,
            };
          }

          // -
          // 1.
          // >
          if (cursor.name === 'ListMark' || cursor.name === 'QuoteMark') {
            return {
              type: 'className',
              className: 'markdown-mark',
              prec,
            };
          }
        }),
        EditorView.theme({
          '.markdown-heading': {
            color: '#00818C',
            fontWeight: '500',
          },
          '.markdown-emphasis': {
            fontStyle: 'italic',
          },
          '.markdown-strong-emphasis': {
            fontWeight: 'bold',
          },
          '.markdown-mark': {
            color: '#4E40E5',
          },
        }),
      ]),
    [injector],
  );

  return null;
}

export { Markdown };
