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
