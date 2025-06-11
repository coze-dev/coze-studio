import path from 'path';

import { type IPlugin, type Program, after } from '@coze-arch/idl2ts-plugin';
import { type IParseEntryCtx } from '@coze-arch/idl2ts-helper';
import { HOOK } from '@coze-arch/idl2ts-generator';

interface Config {
  idlRoot: string;
  outputDir: string;
  projectRoot: string;
}

export class LocalConfigPlugin implements IPlugin {
  config: Config;

  /**
   * @param {} config
   */
  constructor(config: Config) {
    this.config = config;
  }

  apply(program: Program) {
    program.register(after(HOOK.GEN_FILE_AST), this.genLocalConfig.bind(this));
  }

  genLocalConfig(ctx: IParseEntryCtx) {
    const mockFile = { mock: [] };
    const target = path.resolve(this.config.projectRoot, './api.dev.local.js');
    try {
      // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
      const local_config = require(target);
      mockFile.mock = local_config.mock || [];
      // eslint-disable-next-line @coze-arch/no-empty-catch, no-empty
    } catch (error) {}

    const content = `
  module.exports = {
    mock:[${mockFile.mock.map(i => `"${i}"`).join(', ')}],
  }
  `;
    ctx.files.set(target, { type: 'text', content });
    return ctx;
  }
}
