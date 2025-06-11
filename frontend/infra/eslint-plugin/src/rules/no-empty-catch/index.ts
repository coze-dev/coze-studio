import type { Rule } from 'eslint';

export const noEmptyCatch: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Catch error block should not be empty.',
    },
    messages: {
      'no-empty':
        'Catch 代码块中不可为空，否则可能导致错误信息没有得到有效关注',
    },
  },

  create(context) {
    return {
      CatchClause(node) {
        for (const statement of node.body.body) {
          if (
            !['EmptyStatement', 'CommentBlock', 'CommentLine'].includes(
              statement.type,
            )
          ) {
            return;
          }
        }
        context.report({
          node,
          messageId: 'no-empty',
        });
      },
    };
  },
};
