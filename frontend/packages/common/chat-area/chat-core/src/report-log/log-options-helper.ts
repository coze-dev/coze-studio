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
