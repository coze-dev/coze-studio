import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { accessImportedIds, isSameIdentifier, createRule } from '../utils';

const STORE_CREATE_NAME = 'create';

export const properStoreTyping = createRule({
  name: 'zustand/proper-store-typing',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow creating a store without a type parameter',
    },
    messages: {
      storeTyping: 'Require a type parameter when creating a store',
    },
    schema: [],
    hasSuggestions: true,
  },
  create: accessImportedIds({
    [STORE_CREATE_NAME]: ['zustand'],
  })((context, _, ids) => {
    return {
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
            if (!node.typeArguments) {
              context.report({
                node: node.callee,
                messageId: 'storeTyping',
              });
            }
          }
        }
      },
    };
  }),
});
