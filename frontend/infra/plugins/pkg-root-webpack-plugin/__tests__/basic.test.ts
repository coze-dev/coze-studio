import {
  runCompile,
  getConfig,
  getWarnings,
  getErrors,
  readAssets,
} from './helper';

describe('Testing root lookup logic', () => {
  it('import via @ symbol', async () => {
    const config = getConfig('basic/index.js');
    const stats = await runCompile(config);
    expect(getWarnings(stats)).toEqual([]);
    expect(getErrors(stats)).toEqual([]);

    const { compiler } = stats.compilation;
    const assets = await readAssets(compiler, stats);
    expect(assets).toMatchSnapshot('"assets"');

    expect(assets['app.js']).toContain("const foo = 'foo';");
  });
});
