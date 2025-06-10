import { type Program, after, before } from '@coze-arch/idl2ts-plugin';
import { isStructDefinition } from '@coze-arch/idl2ts-helper';

import { type Contexts, HOOK } from '../context';

const MAGIC_COMMENT_KEY = '\n*@magic-comment';

// 忽略 struct 中的字段
export class CommentFormatPlugin {
  apply(p: Program<Contexts>) {
    p.register(after('PARSE_ENTRY'), ctx => {
      const result = ctx.ast;
      for (const item of result) {
        item.statements.forEach(i => {
          if (isStructDefinition(i)) {
            const { fields } = i;
            i.fields = fields.map(i => {
              const comments = i.comments || [];
              let value = '';
              if (comments.length === 1) {
                if (Array.isArray(comments[0].value)) {
                  if (comments[0].value.length > 1) {
                    return i;
                  }
                  value = comments[0].value[0];
                } else {
                  value = comments[0].value;
                }

                comments[0].value = MAGIC_COMMENT_KEY + value;
              }

              return { ...i, comments };
            });
          }
        });
      }
      ctx.ast = result;
      return ctx;
    });
    p.register(before(HOOK.WRITE_FILE), ctx => {
      ctx.content = ctx.content.replaceAll(
        `
  *@magic-comment`,
        '',
      );
      return ctx;
    });
  }
}
