import { type Rule } from 'eslint';
import traverse from 'eslint-traverse';

export const useErrorInCatch: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Use error in catch block',
    },
    messages: {
      'use-error':
        'Catch 中应该对捕获到的 "{{paramName}}" 做一些处理，不可直接忽略',
    },
  },

  create(context: Rule.RuleContext) {
    return {
      CatchClause(node) {
        const errorParam = (node.param as { name: string })?.name;

        let hasUsed = false;
        if (errorParam) {
          traverse(context, node.body, path => {
            const n = path.node;
            if (n.type === 'Identifier' && n.name === errorParam) {
              hasUsed = true;
              return traverse.STOP;
            }
          });
        }
        if (!hasUsed) {
          context.report({
            node,
            messageId: 'use-error',
            data: { paramName: errorParam },
          });
        }
      },
    };
  },
};
