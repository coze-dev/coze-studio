import { buildWorker } from './build-worker';
import { buildAssets } from './build-assets';

const run = async () => {
  await Promise.all([buildAssets(), buildWorker()]);
};

run();
