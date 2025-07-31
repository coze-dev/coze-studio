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

import path from 'path';

import fs from 'fs-extra';
import { Program, on } from '@coze-arch/idl2ts-plugin';
import {
  createFile,
  ignoreField,
  parseFile as parseJs,
  type IParseEntryCtx,
  type ProcessIdlCtx,
  type IGentsRes,
  type IParseResultItem,
  parseDSL,
  isServiceDefinition,
  safeWriteFile,
} from '@coze-arch/idl2ts-helper';
import generator from '@babel/generator';

import { type Options } from './types';
import {
  AdapterPlugin,
  ClientPlugin,
  MetaPlugin,
  MockTransformerPlugin,
  SchemaPlugin,
  PkgEntryPlugin,
  AutoFixPathPlugin,
  IgnoreStructFiledPlugin,
  AutoFixDuplicateIncludesPlugin,
  CommentFormatPlugin,
} from './plugin';
import { type Contexts, HOOK } from './context';

type IParseEntryContext = IParseEntryCtx<ClientGenerator>;

export class ClientGenerator {
  private entries: string[];
  private program: Program<Contexts>;
  private options: Options;
  private nsList: IParseResultItem[] = [];
  private output: IGentsRes = new Map();
  static PLUGIN_PRIORITY = 0;
  private processFile = new Set<string>();
  constructor(options: Options) {
    this.entries = options.entries.map(i => path.resolve(options.idlRoot, i));
    this.options = options;
    const { plugins = [] } = options;
    this.program = Program.create([
      ...plugins,
      new AutoFixPathPlugin(),
      new CommentFormatPlugin(),
      new AutoFixDuplicateIncludesPlugin(),
      new AdapterPlugin(options),
      new MetaPlugin(options),
      new IgnoreStructFiledPlugin({ filter: ignoreField }),
    ]);
    if (options.genClient) {
      this.program.loadPlugins([
        new ClientPlugin(options),
        new PkgEntryPlugin(options),
      ]);
    }
    if (options.genSchema) {
      this.program.loadPlugins([new SchemaPlugin(options)]);
    }
    if (options.genMock) {
      this.program.loadPlugins([new MockTransformerPlugin(options)]);
    }
  }
  private parseAst(parseEntriesCtx: IParseEntryContext) {
    this.program.register(
      on(HOOK.PARSE_ENTRY),
      ctx => {
        ctx.ast = parseDSL(
          this.entries,
          this.options.parsedResult || [],
          this.options.idlRoot,
        );
        return ctx;
      },
      ClientGenerator.PLUGIN_PRIORITY,
    );
    return this.program.trigger(HOOK.PARSE_ENTRY, parseEntriesCtx);
  }
  private genFiles(parseEntriesCtx: IParseEntryContext) {
    this.program.register(
      on(HOOK.GEN_FILE_AST),
      ctx => {
        const files = this.process(ctx.ast);
        ctx.files = files;
        return ctx;
      },
      ClientGenerator.PLUGIN_PRIORITY,
    );
    return this.program.trigger(HOOK.GEN_FILE_AST, parseEntriesCtx);
  }
  gen(): IParseEntryContext {
    const parseEntriesCtx = this.parseAst({
      entries: this.entries,
      instance: this,
      ast: this.options.parsedResult || [],
      files: this.output,
    });
    return this.genFiles(parseEntriesCtx);
  }
  run() {
    const res = this.gen();
    this.program.register(on(HOOK.WRITE_FILE), ctx => {
      const { content, filename } = ctx;
      safeWriteFile(filename, content);
      return ctx;
    });
    for (const [source, file] of res.files) {
      let code = '';
      switch (file.type) {
        case 'babel':
          code = generator(file.content, { comments: true }).code;
          break;
        case 'json':
          code = JSON.stringify(file.content, undefined, 2);
          break;
        case 'text':
          code = file.content;
          break;
        default:
          break;
      }
      this.program.trigger(HOOK.WRITE_FILE, {
        filename: source,
        content: code,
        ast: res.ast,
      });
    }
  }
  private process(processRes: IParseResultItem[]) {
    const output = new Map() as IGentsRes;
    for (const ast of processRes) {
      this.nsList.push(ast);
      const res = this.processIdlAst(ast);
      for (const [key, val] of res) {
        output.set(key, val);
      }
      this.nsList.pop();
    }
    return output;
  }

  private processIdlAst(ast: IParseResultItem) {
    try {
      // The new parser doesn't seem to be sorted by the original position, so it needs to be reordered here.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ast.statements.sort((a, b) => a.loc!.start.line - b.loc!.start.line);
    } catch (error) {
      console.error(error);
    }

    const filename = this.getMockFile(ast);

    const ctx: ProcessIdlCtx = {
      ast,
      dts: createFile(''),
      mock: fs.existsSync(filename)
        ? parseJs(this.getMockFile(ast))
        : createFile(''),
      output: new Map(),
      mockStatements: [],
      meta: [],
    };

    this.program.register(
      on(HOOK.PROCESS_IDL_AST),
      ctx => {
        const { ast } = ctx;
        if (this.processFile.has(ast.idlPath)) {
          return ctx;
        }
        for (const node of ast.statements) {
          const nodeCtx = Object.assign({ node }, ctx);
          if (isServiceDefinition(node) && ast.isEntry) {
            this.program.trigger(HOOK.PARSE_FUN_META, nodeCtx);
          }
          const { mockStatements } = this.program.trigger(
            HOOK.PROCESS_IDL_NODE,
            nodeCtx,
          );
          ctx.mockStatements = mockStatements;
        }
        this.processFile.add(ast.idlPath);
        return ctx;
      },
      ClientGenerator.PLUGIN_PRIORITY,
    );
    return this.program.trigger(HOOK.PROCESS_IDL_AST, ctx).output;
  }

  private getMockFile(ast: IParseResultItem) {
    const { idlPath } = ast;
    const targetName = path.resolve(
      this.options.outputDir,
      path.relative(this.options.idlRoot, idlPath),
    );
    return targetName.replace(/\.(thrift|proto)$/, '.mock.js');
  }
}
