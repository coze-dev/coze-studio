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
