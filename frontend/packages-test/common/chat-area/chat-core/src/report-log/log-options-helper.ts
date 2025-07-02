import { isEmpty } from 'lodash-es';

import { type ReportLogProps } from './index';

function mergeLogOption<T extends ReportLogProps, P extends ReportLogProps>(
  source1: T,
  source2: P,
) {
  const { meta: meta1, ...rest1 } = source1;
  const { meta: meta2, ...rest2 } = source2;

  const meta = {
    ...meta1,
    ...meta2,
  };

  const mergedOptions = {
    ...rest1,
    ...rest2,
    ...(isEmpty(meta) ? {} : { meta }),
  };

  return mergedOptions as T & P;
}
export class LogOptionsHelper<T extends ReportLogProps = ReportLogProps> {
  static merge<T extends ReportLogProps>(...list: ReportLogProps[]) {
    return list.filter(Boolean).reduce((r, c) => mergeLogOption(r, c), {}) as T;
  }

  options: T;

  constructor(options: T) {
    this.options = options;
  }

  get() {
    return this.options;
  }
}
