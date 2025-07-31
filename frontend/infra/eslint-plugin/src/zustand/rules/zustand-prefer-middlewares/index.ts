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

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { ReportSuggestionArray } from '@typescript-eslint/utils/ts-eslint';
import {
  accessImportedIds,
  createRule,
  findCalleeNames,
  isSameIdentifier,
} from '../utils';

const STORE_CREATE_NAME = 'create';

type Middleware =
  | string
  | { name: string; msg?: string; suggestImport?: string };
export interface Option {
  middlewares: Middleware[];
}

export const preferMiddlewares = createRule<
  Option[],
  'preferMiddlewares' | 'applyMiddlewares'
>({
  name: 'zustand/prefer-middlewares',
  defaultOptions: [
    {
      middlewares: [
        {
          name: 'devtools',
          msg: 'Advise using devtools middleware for convenient debugging',
          suggestImport: "import { devtools } from 'zustand/middleware';\n",
        },
      ],
    },
  ],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Create store prefer using some middlewares',
    },
    messages: {
      preferMiddlewares: '{{ msgs }}',
      applyMiddlewares: 'Use {{ name }} middleware',
    },
    schema: {
      type: 'array',
    },
    hasSuggestions: true,
  },
  create: accessImportedIds<Option>({
    [STORE_CREATE_NAME]: ['zustand'],
  })((context, options, ids) => {
    let insetRange = [0, 0] as [number, number];

    return {
      ImportDeclaration(node) {
        if (node.range) {
          insetRange = node.range;
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === STORE_CREATE_NAME
        ) {
          const variable = findVariable(
            context.sourceCode.getScope(node),
            STORE_CREATE_NAME,
          );
          // zustand create

          if (
            isSameIdentifier(
              variable?.identifiers[0],
              ids.get(STORE_CREATE_NAME),
            )
          ) {
            const callExpr =
              node.arguments[0] ||
              (node.parent.type === AST_NODE_TYPES.CallExpression
                ? node.parent.arguments[0]
                : undefined);

            const names = findCalleeNames(callExpr);
            const mids = options[0].middlewares
              .map(it =>
                typeof it === 'object'
                  ? it
                  : { name: it, msg: `advise using ${it}` },
              )
              .filter(m => !names.includes(m.name));

            if (mids.length) {
              context.report({
                node: node.callee,
                messageId: 'preferMiddlewares',
                data: {
                  msgs: mids.map(it => it.msg).join(';'),
                },
                suggest: mids.map(mid => {
                  const n =
                    node.parent.type === AST_NODE_TYPES.CallExpression
                      ? node.parent
                      : node;

                  const insertRange: [number, number] | undefined = n.arguments
                    .length
                    ? n.arguments[0].range
                    : [n.range[1] - 1, n.range[1] - 1];

                  return {
                    fix(fixer) {
                      return [
                        fixer.insertTextBeforeRange(
                          insertRange,
                          `${mid.name}(`,
                        ),
                        fixer.insertTextAfterRange(insertRange, ')'),
                        insetRange && mid.suggestImport
                          ? fixer.insertTextAfterRange(
                              insetRange,
                              mid.suggestImport,
                            )
                          : null,
                      ].filter(Boolean);
                    },
                    messageId: 'applyMiddlewares',
                    data: {
                      name: mid.name,
                    },
                  };
                }) as ReportSuggestionArray<'applyMiddlewares'>,
              });
            }
          }
        }
      },
    };
  }),
});
