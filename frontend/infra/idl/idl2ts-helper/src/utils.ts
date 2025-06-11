import path from 'path';
import fs from 'fs';

export function isPbFile(p: string) {
  return p.endsWith('.proto');
}

export function lookupFile(include: string, search: string[]) {
  let results = include;
  search.forEach(s => {
    const target = path.resolve(s, include);
    if (fs.existsSync(target)) {
      results = target;
    }
  });
  return results;
}
