import path from 'path';

import {
  runCompile,
  getConfig,
  getWarnings,
  getErrors,
  readAssets,
  installPkg,
} from './helper';

beforeAll(() => installPkg(path.join(__dirname, './fixtures/cross-pkgs/foo')));

describe('Testing cross multi packages', () => {
  it('import cross multi packages', async () => {
    const config = getConfig('cross-pkgs/foo/index.js');
    const stats = await runCompile(config);
    expect(getWarnings(stats)).toEqual([]);
    expect(getErrors(stats)).toEqual([]);

    const { compiler } = stats.compilation;
    const assets = await readAssets(compiler, stats);
    expect(assets).toMatchSnapshot("'assets'");
  });
});
