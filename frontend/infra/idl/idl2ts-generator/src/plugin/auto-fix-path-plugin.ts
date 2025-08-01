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
