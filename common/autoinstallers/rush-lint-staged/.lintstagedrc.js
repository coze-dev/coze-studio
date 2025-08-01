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

const {
  excludeIgnoredFiles,
  groupChangedFilesByProject,
  getRushConfiguration,
} = require('./utils');
const micromatch = require('micromatch');
const path = require('path');
const fs = require('fs');

module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': async files => {
    const match = micromatch.not(files, [
      '**/common/_templates/!(_*)/**/(.)?*',
    ]);
    const changedFileGroup = await groupChangedFilesByProject(match);
    const eslintCmds = Object.entries(changedFileGroup)
    .filter(([packageName]) =>
      packageName !== '@coze-arch/arco-icon' && packageName !== '@coze-arch/arco-illustration')
    .map(
      ([packageName, changedFiles]) => {
        const rushConfiguration = getRushConfiguration();
        const { projectFolder, packageName: name } =
          rushConfiguration.getProjectByName(packageName);
        const filesToCheck = changedFiles
          .map(f => path.relative(projectFolder, f))
          .join(' ');
        // TSESTREE_SINGLE_RUN doc https://typescript-eslint.io/packages/parser/#allowautomaticsingleruninference
        // Switch to the project folder and run the ESLint command
        const cmd = [
          `cd ${projectFolder}`,
          `TSESTREE_SINGLE_RUN=true eslint --fix --cache ${filesToCheck} --no-error-on-unmatched-pattern`,
        ].join(' && ');
        return {
          name,
          cmd,
        };
      },
    );

    if (!eslintCmds.length) return [];

    if (eslintCmds.length > 16) {
      console.log(
        `For performance reason, skip ESlint detection due to ${eslintCmds.length} eslint commands.`,
      );
      return [];
    }

    return [
      // The eslintCmds array cannot be returned directly here, because lint-staged executes each command in sequence
      // And concurrently execute multiple commands in parallel
      `concurrently --max-process 8  --names ${eslintCmds
        .map(r => `${r.name}`)
        .join(',')} --kill-others-on-fail ${eslintCmds
        .map(r => `"${r.cmd}"`)
        .join(' ')}`,
    ];
  },
  '**/*.{less,scss,css}': files => {
    // It is only repaired for the time being, and no errors are reported.
    return [`stylelint ${files.join(' ')} --fix || exit 0`];
  },
  '**/package.json': async files => {
    const match = micromatch.not(files, [
      '**/common/_templates/!(_*)/**/(.)?*',
    ]);
    const filesToLint = await excludeIgnoredFiles(match);
    if (!filesToLint) return [];
    return [
      // https://eslint.org/docs/latest/flags/#enable-feature-flags-with-the-cli
      // Eslint v9 finds the configuration from cwd by default. You need to use unstable_config_lookup_from_file configuration here, otherwise an error will be reported.
      `eslint --cache ${filesToLint} --flag unstable_config_lookup_from_file`,
      `prettier ${filesToLint} --write`,
    ];
  },
  '**/!(package).json': 'prettier --write',
};
