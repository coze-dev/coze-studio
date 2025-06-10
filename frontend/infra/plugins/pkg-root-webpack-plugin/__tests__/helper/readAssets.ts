import type { Compiler, Stats } from 'webpack';

import readAsset from './readAsset';

export default async function readAssets(
  compiler: Compiler,
  stats: Stats,
): Promise<Record<string, string>> {
  const keys = Object.keys(stats.compilation.assets);
  const result = (
    await Promise.all(
      keys.map(async k => {
        const res = await readAsset(k, compiler, stats);
        return { [k]: res };
      }),
    )
  ).reduce((res, k) => ({ ...res, ...k }), {});

  return result;
}
