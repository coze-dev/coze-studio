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

import { type Program, after, type IPlugin } from '@coze-arch/idl2ts-plugin';
import { type IParseEntryCtx, isPbFile } from '@coze-arch/idl2ts-helper';

import { HOOK } from '../context';

export class AutoFixDuplicateIncludesPlugin implements IPlugin {
  apply(p: Program<{ PARSE_ENTRY: any }>) {
    p.register(after(HOOK.PARSE_ENTRY), (ctx: IParseEntryCtx) => {
      if (isPbFile(ctx.entries[0])) {
        return ctx;
      }
      ctx.ast = ctx.ast.map(i => {
        const res: string[] = [];
        for (const include of i.includes) {
          if (res.includes(include)) {
            console.error(
              `[${include}]` + `has be includes duplicate in file:${i.idlPath}`,
            );
          } else {
            res.push(include);
          }
        }
        i.includes = res;
        return i;
      });
      return ctx;
    });
  }
}
