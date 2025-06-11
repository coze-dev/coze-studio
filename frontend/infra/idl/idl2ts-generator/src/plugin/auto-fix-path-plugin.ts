import { isAbsolute } from 'path';

import { type Program, after, type IPlugin } from '@coze-arch/idl2ts-plugin';

function ensureRelative(idlPath: string) {
  if (isAbsolute(idlPath)) {
    return idlPath;
  }
  if (!idlPath.startsWith('.')) {
    return `./${idlPath}`;
  }
  return idlPath;
}

export class AutoFixPathPlugin implements IPlugin {
  apply(p: Program<{ PARSE_ENTRY: any }>) {
    p.register(after('PARSE_ENTRY'), ctx => {
      ctx.ast = ctx.ast.map(i => {
        i.includes = i.includes.map(ensureRelative);
        return i;
      });
      return ctx;
    });
  }
}
