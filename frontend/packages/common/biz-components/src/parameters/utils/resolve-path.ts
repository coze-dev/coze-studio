export default function resolvePath(path1: string, path2: string): string {
  if (path1 && path2) {
    return `${path1}.${path2}`;
  }

  return path2 || '';
}
