import { useLayoutEffect } from 'react';

import { useInjector } from '@coze-editor/editor/react';
import { astDecorator } from '@coze-editor/editor';
import { EditorView } from '@codemirror/view';

const prec = 'lowest';

function Jinja() {
  const injector = useInjector();

  useLayoutEffect(
    () =>
      injector.inject([
        astDecorator.whole.of(cursor => {
          if (
            cursor.name === 'JinjaStatement' ||
            cursor.name === 'JinjaRawOpenStatement' ||
            cursor.name === 'JinjaRawCloseStatement'
          ) {
            return {
              type: 'className',
              className: 'jinja-statement',
              prec,
            };
          }

          if (cursor.name === 'JinjaStringLiteral') {
            return {
              type: 'className',
              className: 'jinja-string',
              prec,
            };
          }

          if (cursor.name === 'JinjaComment') {
            return {
              type: 'className',
              className: 'jinja-comment',
              prec,
            };
          }

          if (cursor.name === 'JinjaExpression') {
            return {
              type: 'className',
              className: 'jinja-expression',
              prec,
            };
          }

          if (
            cursor.name === 'JinjaFilterName' ||
            cursor.name === 'JinjaStatementStart' ||
            cursor.name === 'JinjaStatementEnd' ||
            cursor.name === 'JinjaKeyword' ||
            cursor.name === 'JinjaFilterName'
          ) {
            return {
              type: 'className',
              className: 'jinja-statement-keyword',
              prec,
            };
          }
        }),
        EditorView.theme({
          '.jinja-statement': {
            color: '#060709CC',
          },
          '.jinja-statement-keyword': {
            color: '#D1009D',
          },
          '.jinja-string': {
            color: '#060709CC',
          },
          '.jinja-comment': {
            color: '#0607094D',
          },
          '.jinja-expression': {
            color: '#4E40E5',
          },
        }),
      ]),
    [injector],
  );

  return null;
}

export { Jinja };
