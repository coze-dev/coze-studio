import path from 'path';

import { type Config } from 'stylelint';

/**
 * Define an Lint config.
 *
 * @param config StyleLint config.
 * @returns StyleLint config.
 */
export const defineConfig = (config: Config): Config => {
  const { extends: rawExtends, rules = {}, ...userConfig } = config;

  return {
    // @ts-expect-error -- linter-disable-autofix
    extends: [path.resolve(__dirname, '../.stylelintrc.js'), ...rawExtends],
    rules: {
      ...rules,
    },
    ...userConfig,
  };
};
