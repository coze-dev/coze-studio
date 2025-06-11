import path from 'path';

import { type ApiConfig } from './types';

export function lookupConfig<T = ApiConfig>(
  projectRoot: string,
  configName = 'api.config',
) {
  const apiConfigPath = path.resolve(process.cwd(), projectRoot, configName);
  try {
    require.resolve(apiConfigPath);
  } catch (error) {
    throw Error(`Can not find api config in path ${process.cwd()}`);
  }
  // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
  return require(apiConfigPath) as T[];
}
