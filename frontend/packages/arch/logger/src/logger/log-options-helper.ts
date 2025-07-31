/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
