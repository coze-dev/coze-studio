import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createRule, getZustandSetting, isNameMatchPattern } from '../utils';

export const noGetStateInComp = createRule({
  name: 'zustand/no-get-state-in-comp',
  defaultOptions: [],
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Disallow use getState() in components.',
    },
    messages: {
      noGetState:
        'Avoid using {{storeName}}.getState() in react components. Use hooks instead.',
    },
  },

  create: context => {
    const { storeNamePattern } = getZustandSetting(context.settings);

    return {
      'BlockStatement > VariableDeclaration > VariableDeclarator > CallExpression > MemberExpression[property.name="getState"]'(
        node: TSESTree.MemberExpression,
      ) {
        if (node.object.type === AST_NODE_TYPES.Identifier) {
          if (isNameMatchPattern(node.object.name, storeNamePattern)) {
            const blockStatement = node.parent.parent?.parent
              ?.parent as TSESTree.BlockStatement;
            const last = blockStatement.body[blockStatement.body.length - 1];
            if (
              last.type === AST_NODE_TYPES.ReturnStatement &&
              last.argument?.type === AST_NODE_TYPES.JSXElement
            ) {
              context.report({
                node,
                messageId: 'noGetState',
                data: {
                  storeName: node.object.name,
                },
              });
            }
          }
        }
      },
    };
  },
});
