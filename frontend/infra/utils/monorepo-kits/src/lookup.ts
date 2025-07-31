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

import { getRushConfiguration } from './rush-config';

export const lookupTo = (to: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === to);
  if (projects.length === 0) {
    throw new Error(`Project ${to} not found`);
  }
  const project = projects[0];
  const deps = Array.from(project.dependencyProjects.values()).map(
    p => p.packageName,
  );
  return deps;
};

export const lookupFrom = (from: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === from);
  if (projects.length === 0) {
    throw new Error(`Project ${from} not found`);
  }
};

export const lookupOnly = (packageName: string) => {
  const config = getRushConfiguration();
  const projects = config.projects.filter(p => p.packageName === packageName);
  if (projects.length === 0) {
    throw new Error(`Project ${packageName} not found`);
  }
  return projects[0];
};
