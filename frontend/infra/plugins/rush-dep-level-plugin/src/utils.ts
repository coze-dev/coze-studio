export function isValidLevel(v: unknown): v is number {
  return Number.isInteger(v);
}

export function parseTagsLevel(tags: ReadonlySet<string>): number | null {
  const level = [...tags].find(tag => tag.startsWith('level-'));
  return level ? parseInt(level.split('-')[1]) : null;
}

export function isDepLevelMatch(
  projectLevel: number,
  dependencyLevel: number,
): boolean {
  return projectLevel >= dependencyLevel;
}
