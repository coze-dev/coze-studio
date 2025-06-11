import type { Rule } from 'eslint';

export const noNewErrorRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: "Don't use new Error()",
    },
    fixable: 'code',
    messages: {
      'no-new-error': 'found use new Error()',
    },
  },

  create(context) {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Error') {
          context.report({
            node,
            messageId: 'no-new-error',
            fix(fixer) {
              const args = node.arguments.map(arg => context.sourceCode.getText(arg)).join(',') || '\'custom error\'';
              return fixer.replaceText(node, `new CustomError('normal_error', ${args})`);
            },
          });
        }
      },
    };
  },
};
