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

import { type Program, after } from '@coze-arch/idl2ts-plugin';
import {
  isStructDefinition,
  type FieldDefinition,
} from '@coze-arch/idl2ts-helper';

type Filter = (f: FieldDefinition) => boolean;

interface IPops {
  filter: Filter;
}

// Ignore fields in struct
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
