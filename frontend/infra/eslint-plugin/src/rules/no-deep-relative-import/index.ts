import { Rule } from 'eslint';

const isTooDeep = (declare: string, maxLevel: number) => {
  const match = /^(\.\.\/)+/.exec(declare);
  if (match) {
    // 3 = '../'.length
    const deep = match[0].length / 3;
    if (deep >= maxLevel) {
      return true;
    }
  }
  return false;
};

export const noDeepRelativeImportRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect how deep levels in import/require statments',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
          },
        },
      },
    ],
    messages: {
      max: "Don't import module exceed {{max}} times of '../'. You should use some alias to avoid such problem.",
    },
  },
  create(context) {
    const { max = 3 } = context.options[0] || {};
    return {
      ImportDeclaration(node) {
        if (typeof node.source.value === 'string') {
          const declare = node.source.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') {
          return;
        }
        if (node.callee.name !== 'require') {
          return;
        }
        if (node.arguments.length !== 1) {
          return;
        }
        const arg = node.arguments[0];
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const declare = arg.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
      ImportExpression(node) {
        if (
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string'
        ) {
          const declare = node.source.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
    };
  },
};
