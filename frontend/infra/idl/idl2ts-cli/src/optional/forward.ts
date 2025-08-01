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
