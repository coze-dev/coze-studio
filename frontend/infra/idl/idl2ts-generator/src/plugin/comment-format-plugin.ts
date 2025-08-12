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

import { type Program, after, before } from '@coze-arch/idl2ts-plugin';
import { isStructDefinition } from '@coze-arch/idl2ts-helper';

import { type Contexts, HOOK } from '../context';

const MAGIC_COMMENT_KEY = '\n*@magic-comment';

// Ignore fields in struct
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
