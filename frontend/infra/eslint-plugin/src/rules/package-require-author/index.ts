import path from 'path';
import type { Rule } from 'eslint';

// cp-disable-next-line
const isBytedancer = name => name.endsWith('@bytedance.com');

export const requireAuthorRule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'validate author & maintainer property in package.json',
    },
    messages: {
      requireAuthor:
        'package.json 文件必须提供 author 字段，这有助于正确生成 CODEOWNER 文件，帮助正确指定代码 reviewer',
      authorShouldBeBytedancer:
        // cp-disable-next-line
        'package.json 文件的 author 字段值应该为 `@bytedance.com` 结尾的邮箱名',
      maintainerShouldBeBytedancers:
        // cp-disable-next-line
        'package.json 文件的 maintainers 字段值应该为 `@bytedance.com` 结尾的邮箱名数组',
    },
  },

  create(context) {
    const filename = context.getFilename();
    if (path.basename(filename) !== 'package.json') {
      return {};
    }

    return {
      AssignmentExpression(node) {
        const json = node.right;
        const authorProp = (json as any).properties.find(
          p => p.key.value === 'author',
        );
        if (!authorProp) {
          context.report({
            node: json,
            messageId: 'requireAuthor',
          });
        } else {
          const authorValue = authorProp.value;
          if (!isBytedancer(authorValue.value)) {
            context.report({
              node: authorValue,
              messageId: 'authorShouldBeBytedancer',
              data: { author: authorValue.value },
            });
          }
        }

        const maintainerProp = (json as any).properties.find(
          p => p.key.value === 'maintainers',
        );
        if (maintainerProp) {
          const maintainers = maintainerProp.value;
          if (maintainers.elements?.some(p => !isBytedancer(p.value))) {
            context.report({
              node: maintainers,
              messageId: 'maintainerShouldBeBytedancers',
            });
          }
        }
      },
    };
  },
};
