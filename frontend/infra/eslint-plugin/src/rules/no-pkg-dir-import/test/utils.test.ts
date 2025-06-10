import { exportPathMatch } from '../utils';

describe('exportPathMatch', () => {
  it.each([
    ['./foo', './foo'],
    ['./foo.js', './*'],
    ['./foo.js', './*.js'],
    ['./foo/baz', './foo/*'],
    ['./foo/baz/baz.js', './foo/*'],
  ])(
    'import path is %s, export path is %s, should be matched',
    (importPath, exportPath) => {
      expect(exportPathMatch(importPath, exportPath)).toBe(true);
    },
  );

  it.each([
    ['./foo', './bar'],
    ['./foo.js', './*.ts'],
    ['./foo.js', './foo.ts'],
    ['./baz/bar', './foo/*'],
    ['./foo/bar/baz.js', './foo/*.js'],
  ])(
    'import path is %s, export path is %s, should NOT be matched',
    (importPath, exportPath) => {
      expect(exportPathMatch(importPath, exportPath)).toBe(false);
    },
  );
});
