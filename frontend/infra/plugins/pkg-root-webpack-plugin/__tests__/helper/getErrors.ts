import type { Stats } from 'webpack';

import normalizeErrors from './normalizeErrors';

export default (stats: Stats): string[] =>
  normalizeErrors(stats.compilation.errors.sort());
