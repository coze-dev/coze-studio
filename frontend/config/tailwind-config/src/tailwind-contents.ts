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

import {
  lookupSubPackages,
  getPackageLocation,
  getPackageJson,
} from '@coze-arch/monorepo-kits';

export const getTailwindContents = (projectRoot: string) => {
  if (!projectRoot) {
    throw new Error('projectRoot is required');
  }
  const contents = [path.resolve(__dirname, '../src/**/*.{tsx,ts}')];

  const subPackages = lookupSubPackages(projectRoot);
  const packageLocations = subPackages
    .filter(p => {
      const packageJson = getPackageJson(p);
      const deps = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.peerDependencies || {}),
      ];
      return deps.includes('react');
    })
    .map(getPackageLocation);
  contents.push(
    ...packageLocations
      .filter(r => !!r)
      .map(location => path.resolve(location, 'src/**/*.{ts,tsx}')),
  );

  // Compatible with coze-design internal tailwind style
  contents.push('./node_modules/@coze-arch/coze-design/**/*.{js,jsx}');

  return contents;
};
