import path from 'path';

export function exportPathMatch(importPath: string, pkgExportPath: string) {
  if (importPath === pkgExportPath) {
    return true;
  }
  const pkgExportBasename = path.basename(pkgExportPath);

  if (importPath.startsWith(path.dirname(pkgExportPath))) {
    if (pkgExportBasename === '*') {
      return true;
    }
    if (path.dirname(importPath) === path.dirname(pkgExportPath)) {
      return pkgExportBasename === `*${path.extname(importPath)}`;
    }
  }
  return false;
}
