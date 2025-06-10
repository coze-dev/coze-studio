import { type Program, after } from '@coze-arch/idl2ts-plugin';
import {
  isStructDefinition,
  type FieldDefinition,
} from '@coze-arch/idl2ts-helper';

type Filter = (f: FieldDefinition) => boolean;

interface IPops {
  filter: Filter;
}

// 忽略 struct 中的字段
export class IgnoreStructFiledPlugin {
  private filter: Filter;
  constructor({ filter }: IPops) {
    this.filter = filter;
  }
  apply(p: Program<{ PARSE_ENTRY: { ast: any } }>) {
    p.register(after('PARSE_ENTRY'), ctx => {
      const result = ctx.ast;
      for (const item of result) {
        item.statements.forEach(i => {
          if (isStructDefinition(i)) {
            const { fields } = i;
            i.fields = fields.filter(f => this.filter(f));
          }
        });
      }
      ctx.ast = result;
      return ctx;
    });
  }
}
