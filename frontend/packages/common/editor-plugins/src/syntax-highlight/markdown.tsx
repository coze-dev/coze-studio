import { useLayoutEffect } from 'react';

import { useInjector } from '@flow-lang-sdk/editor/react';
import { astDecorator } from '@flow-lang-sdk/editor';
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
