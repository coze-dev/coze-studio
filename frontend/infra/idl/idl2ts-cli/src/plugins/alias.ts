import { type Program, on } from '@coze-arch/idl2ts-plugin';
import {
  type IParseEntryCtx,
  isServiceDefinition,
} from '@coze-arch/idl2ts-helper';
import { HOOK } from '@coze-arch/idl2ts-generator';

export class AliasPlugin {
  alias = new Map();

  constructor(alias: Map<string, string>) {
    this.alias = alias;
  }

  apply(program: Program) {
    program.register(on(HOOK.PARSE_ENTRY), this.setAlias.bind(this));
  }

  setAlias(ctx: IParseEntryCtx) {
    ctx.ast.forEach(i => {
      if (i.isEntry) {
        i.statements.forEach(s => {
          if (isServiceDefinition(s) && this.alias.has(i.idlPath)) {
            s.name.value = this.alias.get(i.idlPath);
          }
        });
      }
    });
    return ctx;
  }
}
