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

import { genClient } from '@coze-arch/idl2ts-generator';

import { lookupConfig } from './utils';
import { type ApiConfig, type ApiTypeConfig } from './types';
import { MockPlugin } from './plugins/mock-plugin';
import { LocalConfigPlugin } from './plugins/local-config';
import { FormatPlugin } from './plugins/formatter';
import { FilterTypesPlugin } from './plugins/filter-types-plugin';
import { AliasPlugin } from './plugins/alias';

interface GenOptions {
  formatConfig?: string;
}

export const gen = (projectRoot: string, options: GenOptions) => {
  const configs = lookupConfig(projectRoot);

  function genSingle(config: ApiConfig) {
    const {
      entries,
      plugins = [],
      commonCodePath,
      aggregationExport,
      formatter,
    } = config;
    const aliasMap = new Map();
    const idlRoot = path.resolve(projectRoot, config.idlRoot);
    const output = path.resolve(projectRoot, config.output);
    const realEntries = [] as string[];
    Object.keys(entries).forEach(i => {
      aliasMap.set(path.resolve(idlRoot, entries[i]), i);
      realEntries.push(entries[i]);
    });

    genClient({
      entries: realEntries,
      idlRoot: path.resolve(projectRoot, idlRoot),
      genSchema: false,
      genClient: true,
      genMock: false,
      plugins: [
        new MockPlugin(),
        new AliasPlugin(aliasMap),
        new FormatPlugin({
          path: path.resolve(
            process.cwd(),
            options.formatConfig || '.prettierrc',
          ),
          formatter,
        }),
        new LocalConfigPlugin({ outputDir: output, projectRoot, idlRoot }),
        ...plugins,
      ],
      entryName: aggregationExport || 'index',
      outputDir: output,
      commonCodePath,
    });
  }
  configs.forEach(c => {
    genSingle(c);
  });
};

export const genTypes = (projectRoot: string, options: GenOptions) => {
  const configs = lookupConfig<ApiTypeConfig>(projectRoot, 'api.filter.js');

  function genSingle(config: ApiTypeConfig) {
    const {
      entries,
      plugins = [],
      commonCodePath,
      aggregationExport,
      formatter,
      filters,
    } = config;
    const aliasMap = new Map();
    const idlRoot = path.resolve(projectRoot, config.idlRoot);
    const output = path.resolve(projectRoot, config.output);
    const realEntries = [] as string[];
    Object.keys(entries).forEach(i => {
      aliasMap.set(path.resolve(idlRoot, entries[i]), i);
      realEntries.push(entries[i]);
    });

    genClient({
      entries: realEntries,
      idlRoot: path.resolve(projectRoot, idlRoot),
      genSchema: false,
      genClient: true,
      genMock: false,
      plugins: [
        new MockPlugin(),
        new AliasPlugin(aliasMap),
        new FormatPlugin({
          path: path.resolve(
            process.cwd(),
            options.formatConfig || '.prettierrc',
          ),
          formatter,
        }),
        new LocalConfigPlugin({ outputDir: output, projectRoot, idlRoot }),
        new FilterTypesPlugin(filters, output),
        ...plugins,
      ],
      entryName: aggregationExport || 'index',
      outputDir: output,
      commonCodePath,
    });
  }
  configs.forEach(c => {
    genSingle(c);
  });
};

export function defineConfig(c: ApiConfig[]) {
  return c;
}

export function defineApiTpeConfig(c: ApiTypeConfig[]) {
  return c;
}
