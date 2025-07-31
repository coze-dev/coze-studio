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

import fs from 'fs';

import { format } from 'prettier';
import { type Program, on } from '@coze-arch/idl2ts-plugin';
import { HOOK, type WriteFileCtx } from '@coze-arch/idl2ts-generator';
interface IOption {
  path: string;
  formatter?: (content: string, filename: string) => string;
}
function isPromise(p: any) {
  return (
    p.then &&
    typeof p.then === 'function' &&
    typeof p.catch === 'function' &&
    typeof p.finally === 'function'
  );
}

function readConfig(file: string) {
  let config = {};
  try {
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
    config = require(file);
    if (!config) {
      const content = fs.readFileSync(file, { encoding: 'utf8' });
      config = JSON.parse(content);
    }
    // eslint-disable-next-line @coze-arch/no-empty-catch
  } catch (error) {
    // just
  }
  return config;
}

export class FormatPlugin {
  private config: any;
  private formatter?: (content: string, filename: string) => string;
  constructor(op: IOption) {
    this.config = readConfig(op.path);
    this.formatter = op.formatter;
  }
  apply(program: Program) {
    program.register(on(HOOK.WRITE_FILE), this.format.bind(this));
  }

  format(ctx: WriteFileCtx) {
    if (this.formatter) {
      ctx.content = this.formatter(ctx.content, ctx.filename);
      return ctx;
    }
    if (ctx.filename.endsWith('ts')) {
      try {
        const content = format(ctx.content, {
          ...this.config,
          parser: 'typescript',
        });
        if (!isPromise(content)) {
          // @ts-expect-error fixme late
          ctx.content = content;
        }
      } catch (error) {
        console.warn(error);
      }
    }
    return ctx;
  }
}
