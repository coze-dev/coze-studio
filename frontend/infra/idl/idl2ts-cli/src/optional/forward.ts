import { type IPlugin, type Program, after } from '@coze-arch/idl2ts-plugin';
import {
  type IParseEntryCtx,
  isServiceDefinition,
} from '@coze-arch/idl2ts-helper';
import { HOOK } from '@coze-arch/idl2ts-generator';

interface IOptions {
  patch: {
    [service: string]: {
      prefix?: string;
      method?: { [name: string]: 'GET' | 'POST' };
    };
  };
}

export class PatchPlugin implements IPlugin {
  private options: IOptions;
  constructor(options: IOptions) {
    this.options = options;
  }
  apply(p: Program) {
    p.register(after(HOOK.PARSE_ENTRY), (ctx: IParseEntryCtx) => {
      ctx.ast = ctx.ast.map(i => {
        i.statements.map(s => {
          if (isServiceDefinition(s) && this.options.patch[s.name.value]) {
            const { prefix = '/', method = {} } =
              this.options.patch[s.name.value];
            s.functions.forEach(f => {
              f.extensionConfig = {
                uri: `${prefix}/${f.name.value}`,
                method: method[f.name.value] || 'POST',
              };
            });
          }
          return s;
        });
        return i;
      });
      return ctx;
    });
  }
}
