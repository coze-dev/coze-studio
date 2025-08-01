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
