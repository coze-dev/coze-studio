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

import { EOL } from 'os';

import { type IPlugin, type Program, after } from '@coze-arch/idl2ts-plugin';
import {
  type ProcessIdlCtx,
  type IParseEntryCtx,
  getRelativePath,
  createFile,
  getOutputName,
} from '@coze-arch/idl2ts-helper';

import { type Options } from '../types';
import { type Contexts, HOOK } from '../context';

/**
 * Provide unified API entry
 */
export class PkgEntryPlugin implements IPlugin {
  private options: Options;
  private funcs: Map<string, string> = new Map();
  private entryName: string;
  constructor(options: Options) {
    this.options = options;
    this.entryName = `/${this.options.entryName || 'api'}.ts`;
  }
  apply(program: Program<Contexts>): void {
    program.register(after(HOOK.PARSE_FUN_META), this.collectFuncs.bind(this));
    program.register(after(HOOK.GEN_FILE_AST), this.genPkgEntry.bind(this));
    program.register(after(HOOK.GEN_FILE_AST), this.genValidateFile.bind(this));
  }
  private collectFuncs(ctx: ProcessIdlCtx) {
    const { ast, meta } = ctx;
    const relativePath = getRelativePath(
      this.options.idlRoot + this.entryName,
      ast.idlPath,
    );
    this.funcs.set(
      relativePath,
      // Only single service supported
      meta[0].service,
    );
    return ctx;
  }
  private genPkgEntry = (ctx: IParseEntryCtx) => {
    const targetFile = this.options.outputDir + this.entryName;
    let source = '';
    for (const [path, service] of this.funcs.entries()) {
      source += `export * as ${service} from '${path}';${EOL}`;
    }
    const content = createFile(source);
    ctx.files.set(targetFile, { content, type: 'babel' });
    return ctx;
  };
  private genValidateFile = (ctx: IParseEntryCtx) => {
    const { ast } = ctx;
    const targetFile = `${this.options.outputDir}/_schemas.js`;
    const targetFileTypes = `${this.options.outputDir}/_schemas.d.ts`;
    const schemaFiles = this.options.genSchema
      ? ast.map(
          i =>
            `${getRelativePath(
              targetFile,
              getOutputName({
                source: i.idlPath,
                ...this.options,
              }),
            )}.schema.json`,
        )
      : [];
    const code = schemaFiles.map(i => `  require("${i}")`).join(`,${EOL}`);
    ctx.files.set(targetFile, {
      content: `module.exports = [${EOL + code + EOL}] `,
      type: 'text',
    });
    ctx.files.set(targetFileTypes, {
      content: `declare const _schemas: any[];
export default _schemas;
      `,
      type: 'text',
    });
    ctx.files.set(`${this.options.outputDir}/_mock_utils.js`, {
      content: getMockUtils(),
      type: 'text',
    });
    return ctx;
  };
}

function getMockUtils() {
  return `function rawParse(str) {
    const lines = (str || '').split('\\n');
    const entries = lines.map((line) => {
      line = line.trim();
      const res = line.match(/at (.+) \\((.+)\\)/)||[]
      return {
        beforeParse: line,
        callee: res[1]
      };
    });
    return entries.filter((x) => x.callee !== undefined);
  }

  function createStruct(fn) {
    const structFactory = () => {
      const error = new Error();
      const items = rawParse(error.stack).filter((i) => i.callee === 'structFactory').map((i) => i.beforeParse);
      const isCircle = items.length > Array.from(new Set(items)).length;
      if (isCircle) {
        return {};
      }
      const res = fn();

      return res;
    };

    return structFactory;
  }
  module.exports={ createStruct }
  `;
}
