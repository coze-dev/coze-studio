import { isEmpty } from 'lodash-es';

import { type CommonLogOptions } from '../types';
function mergeLogOption<T extends CommonLogOptions, P extends CommonLogOptions>(
  source1: T,
  source2: P,
) {
  const { action: action1 = [], meta: meta1, ...rest1 } = source1;
  const { action: action2 = [], meta: meta2, ...rest2 } = source2;

  const meta = {
    ...meta1,
    ...meta2,
  };

  const res: CommonLogOptions = {
    ...rest1,
    ...rest2,
    action: [...action1, ...action2],
    ...(isEmpty(meta) ? {} : { meta }),
  };
  return res;
}

export class LogOptionsHelper<T extends CommonLogOptions = CommonLogOptions> {
  static merge<T extends CommonLogOptions>(...list: CommonLogOptions[]) {
    return list.filter(Boolean).reduce((r, c) => mergeLogOption(r, c), {}) as T;
  }

  options: T;

  constructor(options: T) {
    this.options = options;
  }

  updateMeta(
    updateCb: (
      prevMeta?: Record<string, unknown>,
    ) => Record<string, unknown> | undefined,
  ) {
    this.options.meta = updateCb(this.options.meta);
  }

  get() {
    return this.options;
  }
}
