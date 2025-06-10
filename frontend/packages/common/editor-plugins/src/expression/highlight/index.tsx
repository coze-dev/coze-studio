import { useLayoutEffect } from 'react';

import { useInjector } from '@flow-lang-sdk/editor/react';
import { astDecorator } from '@flow-lang-sdk/editor';
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
