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

import { type RushConfigurationProject } from '@rushstack/rush-sdk';

import { getRushConfiguration } from './rush-config';

export const lookupSubPackages = (() => {
  const cachedSubPackages = new Map();

  return (packageName: string): string[] => {
    if (cachedSubPackages.has(packageName)) {
      return cachedSubPackages.get(packageName);
    }
    const result: string[] = [];
    cachedSubPackages.set(packageName, result);
    const rushConfig = getRushConfiguration();
    const project = rushConfig.projects.find(
      p => p.packageName === packageName,
    );
    if (!project) {
      throw new Error(`Project ${packageName} not found`);
    }
    const deps = Array.from(project.dependencyProjects.values()).map(
      p => p.packageName,
    );
    const subPackages: string[] = [];
    for (const dep of deps) {
      subPackages.push(dep);
      const descendants = lookupSubPackages(dep);
      subPackages.push(...descendants);
    }
    result.push(...Array.from(new Set(subPackages)));
    return result;
  };
})();

export const getPackageLocation = (packageName: string): string => {
  const rushConfig = getRushConfiguration();
  const project = rushConfig.projects.find(p => p.packageName === packageName);
  if (!project) {
    throw new Error(`Project ${packageName} not found`);
  }
  return project.projectFolder;
};

export const getPackageJson = (
  packageName: string,
): RushConfigurationProject['packageJson'] => {
  const rushConfig = getRushConfiguration();
  const project = rushConfig.projects.find(p => p.packageName === packageName);
  if (!project) {
    throw new Error(`Project ${packageName} not found`);
  }
  return project.packageJson;
};
