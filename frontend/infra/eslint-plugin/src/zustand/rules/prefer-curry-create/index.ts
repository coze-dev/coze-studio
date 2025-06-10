import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { accessImportedIds, createRule, isSameIdentifier } from '../utils';

const STORE_CREATE_NAME = 'create';

export const preferCurryCreate = createRule({
  name: 'zustand/prefer-curry-create',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer using curry to create store pattern',
    },
    messages: {
      preferCurryCreate:
        'Do not use create(). Prefer using curry create pattern',
      curryCreate: 'Use curry create pattern',
    },
    schema: [],
    hasSuggestions: true,
  },
  create: accessImportedIds({
    [STORE_CREATE_NAME]: ['zustand'],
  })((context, _, ids) => {
    return {
      'VariableDeclarator > CallExpression'(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === STORE_CREATE_NAME
        ) {
          const variable = findVariable(
            context.sourceCode.getScope(node),
            STORE_CREATE_NAME,
          );
          if (
            isSameIdentifier(
              variable?.identifiers[0],
              ids.get(STORE_CREATE_NAME) as TSESTree.Identifier,
            )
          ) {
            context.report({
              node: node.callee,
              messageId: 'preferCurryCreate',
              suggest: [
                {
                  fix(fixer) {
                    return fixer.insertTextAfter(
                      node.typeArguments || node.callee,
                      '()',
                    );
                  },
                  messageId: 'curryCreate',
                },
              ],
            });
          }
        }
      },
    };
  }),
});
