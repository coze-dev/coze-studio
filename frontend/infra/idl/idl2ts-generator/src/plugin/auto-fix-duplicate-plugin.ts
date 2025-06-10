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
